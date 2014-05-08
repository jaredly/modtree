/** @jsx React.DOM */

var d = React.DOM
  , PropsTable = require('./props-table.jsx')

var Component = module.exports = React.createClass({
  displayName: 'Component',
  getDefaultProps: function () {
    return {
      name: 'path/to/thin',
      isRoute: undefined,
      clickable: true,
      node: {},
      selected: false,
      onSelect: function () {console.log('selected')}
    }
  },
  componentWillMount: function () {
    this.timeout = null
  },
  startTimeout: function () {
    this.killTimeout()
    this.timeout = setTimeout(function () {
      this.props.onShow()
    }.bind(this), 200)
  },
  killTimeout: function () {
    if (this.timeout) clearTimeout(this.timeout)
    delete this.timeout
  },
  onSelect: function () {
    if (!this.props.selected) {
      return this.props.onShow()
    }
    this.props.onSelect()
  },
  render: function () {
    var routeName = false
      , cls = 'mod-html_comp'
      , comp = this.props.node
      , selected = this.props.selected
    if (undefined !== this.props.isRoute) {
      cls += ' mod-html_comp--route'
      routeName = (
        <span className='mod-html_route-name'>
          {'/' + (this.props.isRoute ? this.props.isRoute : '')}
        </span>
      )
    }
    if (selected) {
      cls += ' mod-html_comp--selected'
    }
    if (this.props.clickable) {
      cls += ' mod-html_comp--clickable'
    }
    if (!routeName) {
      cls += ' mod-html_comp--routeless'
    }
    return (
      <div className={cls}
           onMouseOver={selected ? false : this.startTimeout}
           onMouseOut={this.killTimeout}
           onClick={this.props.clickable && this.onSelect}>
        {routeName}
        <div title={this.props.name} className='mod-html_comp_title'>
          {comp.displayName}
        </div>
        <div className='mod-html_comp_props-c'>
        <PropsTable isRouter={comp.router} props={comp.defaultProps || {}}/>
        </div>
        <div className='mod-html_comp_extras'>
          {comp.fixture ? d.div({className: 'mod-html_comp_fixtures'}, Object.keys(comp.fixture).length) : false}
          {comp.router ? d.div({className: 'mod-html_comp_router'}) : false}
          {comp.model ? d.div({className: 'mod-html_comp_model'}) : false}
        </div>
        {comp.deps.length ? d.div({className: ' mod-html_comp_deps', 'data-value': comp.deps.length}, comp.deps.length): false}
      </div>
    )
  }
})

// vim: set tabstop=2 shiftwidth=2 expandtab:

