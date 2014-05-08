/** @jsx React.DOM */

var AutoComplete = require('./autocomplete.jsx')
  , d = React.DOM

function calcLineages(components, root, lineages) {
  lineages = lineages || {}
  var mine = (lineages[root] || []).concat([root])
  components[root].deps.forEach(function (name) {
    if (lineages[name]) return
    lineages[name] = mine
    calcLineages(components, name, lineages)
  })
  return lineages
}

var ModTree = module.exports = React.createClass({
  displayName: 'ModTree',
  getDefaultProps: function () {
    return {
      onSelect: function (name) {console.log('Selected', name)},
      nodes: {
        /*
        node_id: {
          deps: ['child_id', 'other_child', '...'],
          displayName: 'Name',
          router: false,
          model: true,
          routes: {
            'thing': 'node_id',
            'other': 'node_id',
          },
          defaultProps: {},
          fixture: {
            fixture_name: {}
          }
        }
        */
      }
    }
  },
  componentWillMount: function () {
    this.timeouts = {}
  },
  getInitialState: function () {
    return {
      showing: [Object.keys(this.props.nodes)[0]],
    }
  },
  showNode: function (item) {
    if (!item.lineage) return
    this.setState({
      showing: item.lineage
    })
  },
  startTimeout: function (name, lineage) {
    this.killTimeout(name)
    this.timeouts[name] = setTimeout(function () {
      this.showNode({lineage: lineage})
    }.bind(this), 200)
  },
  killTimeout: function (name) {
    if (this.timeouts[name]) clearTimeout(this.timeouts[name])
    delete this.timeouts[name]
  },
  onSelect: function (name, lineage) {
    if (this.state.showing.indexOf(name) !== -1) {
      return this.showNode(lineage)
    }
    this.props.onSelect(name)
  },
  compBody: function (name, isRoute, lineages) {
    var routeName = false
      , cls = 'mod-html_comp'
      , comp = this.props.nodes[name]
      , selected = this.state.showing.indexOf(name) !== -1
    if (undefined !== isRoute) {
      cls += ' mod-html_comp--route'
      routeName = (
        <span className='mod-html_route-name'>
          {'/' + (isRoute ? isRoute : '')}
        </span>
      )
    }
    if (selected) {
      cls += ' mod-html_comp--selected'
    }
    var linup = (lineages[name] || []).concat([name])
    return (
      <div className={cls}
           onMouseOver={selected ? false : this.startTimeout.bind(null, name, linup)}
           onMouseOut={this.killTimeout.bind(null, name)}
           onClick={this.onSelect.bind(null, name, linup)}>
        {routeName}
        <div title={name} className='mod-html_comp_title'>
          {comp.displayName}
        </div>
        <table className='mod-html_comp_props'>
          {
            Object.keys(comp.defaultProps || {}).map(function (name) {
              if (name[0] === '_') return false
              if (name === 'goTo' && comp.routes) return false // from Router
              return (
                <tr key={name}>
                  <td className='mod-html_comp_prop'>{name}</td>
                  <td className='mod-html_comp_prop-value'>{'' + comp.defaultProps[name]}</td>
                </tr>
              )
            })
          }
        </table>
        <div className='mod-html_comp_extras'>
          {comp.fixture ? d.div({className: 'mod-html_comp_fixtures'}, Object.keys(comp.fixture).length) : false}
          {comp.router ? d.div({className: 'mod-html_comp_router'}) : false}
          {comp.model ? d.div({className: 'mod-html_comp_model'}) : false}
          {comp.deps.length ? d.div({className: ' mod-html_comp_deps', 'data-value': comp.deps.length}, comp.deps.length): false}
        </div>
      </div>
    )
  },
  row: function (name, lineages) {
    var comp = this.props.nodes[name]
      , deps = comp.deps
      , items = []
      , routed = {}
      , cname 
      , cls
    if (comp.routes) {
      for (var route in comp.routes) {
        if ('string' === typeof comp.routes[route]) continue
        cls = comp.routes[route]
        if (Array.isArray(cls)) cls = cls[0]
        cname = cls._file_origin
        items.push(this.compBody(cname, route, lineages))
        routed[cname] = true
      }
    }
    deps.forEach(function (name) {
      if (routed[name]) return
      items.push(this.compBody(name, undefined, lineages))
    }.bind(this))
    if (!items.length) return false
    return (
      <div key={name} className='mod-html_row'>
        {items}
      </div>
    )
  },
  render: function () {
    var completeNames = []
      , components = this.props.nodes
      , names = Object.keys(components)
      , lineages = calcLineages(components, names[0])
      , prefix = commonPrefix(names)
    for (var name in components) {
      completeNames.push({
        title: components[name].displayName || name.split('/').slice(-1)[0],
        lineage: (lineages[name] || []).concat([name]),
        subtitle: name.slice(prefix.length),
        id: name
      })
    }
    return (
      <div className='mod-html'>
        <AutoComplete initialValue='' completions={completeNames} onSelect={this.showNode}/>
        <div className='mod-html_row'>
          {this.compBody(this.state.showing[0], undefined, lineages)}
        </div>
        {
          this.state.showing.map(function (one) {
            return this.row(one, lineages)
          }.bind(this))
        }
      </div>
    )
  }
})

function commonPrefix(names) {
  var common = names[0]
  for (var i=1; i<names.length; i++) {
    if (names[i].indexOf(common) === 0) continue
    for (var j=1; j < common.length; j++) {
      if (names[i].indexOf(common.slice(0, -j)) === 0) {
        common = common.slice(0, -j)
        break
      }
    }
  }
  return common
}

// vim: set tabstop=2 shiftwidth=2 expandtab:

