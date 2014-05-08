/** @jsx React.DOM */

var AutoComplete = require('./autocomplete.jsx')
  , Component = require('./component.jsx')
  , d = React.DOM

function calcLineages(components, root, lineages) {
  lineages = lineages || {}
  if (!lineages[root]) lineages[root] = [root]
  var mine = lineages[root]
  components[root].deps.forEach(function (name) {
    if (lineages[name]) return
    lineages[name] = mine.concat([name])
    calcLineages(components, name, lineages)
  })
  return lineages
}

var ModTree = module.exports = React.createClass({
  displayName: 'ModTree',
  getDefaultProps: function () {
    return {
      onSelect: function (name) {console.log('Selected', name)},
      clickable: [],
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
        items.push(this.compBody(cname, route, lineages[cname]))
        routed[cname] = true
      }
    }
    deps.forEach(function (name) {
      if (routed[name]) return
      items.push(this.compBody(name, undefined, lineages[name]))
        // this.compBody(name, undefined, lineages))
    }.bind(this))
    if (!items.length) return false
    return (
      <div key={'row-' + name} className='mod-html_row'>
        {items}
      </div>
    )
  },
  compBody: function (name, isRoute, lineage) {
    return Component({
      name: name,
      key: name,
      isRoute: isRoute,
      clickable: this.props.clickable.indexOf(name) !== -1,
      node: this.props.nodes[name],
      selected: this.state.showing.indexOf(name) !== -1,
      onSelect: this.props.onSelect.bind(null, name),
      onShow: this.showNode.bind(null, {lineage: lineage})
    })
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
        lineage: lineages[name],
        subtitle: name.slice(prefix.length),
        id: name
      })
    }
    return (
      <div className='mod-html'>
        <AutoComplete initialValue='' completions={completeNames} onSelect={this.showNode}/>
        <div className='mod-html_row'>
          {this.compBody(this.state.showing[0], undefined, lineages[this.state.showing[0]])}
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

