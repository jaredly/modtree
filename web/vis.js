
var d = React.DOM

var Main = module.exports = React.createClass({
  displayName: 'ModTree',
  getDefaultProps: function () {
    return {
      onClick: function (what) {console.log('click', what)},
      // id -> {title: str, [color: str]}
      nodes: {},
      // [[from, to], ...]
      links: [],
      // for vis
      options: {}
    }
  },
  visData: function () {
    var nodes = []
      , minl = -1
      , l
    for (var name in this.props.nodes) {
      l = name.split('/').length
      if (minl === -1 || l < minl) minl = l
      nodes.push({
        id: name,
        // level: l,
        label: this.props.nodes[name].title || name.split('/').slice(-1)[0]
      })
    }
    /*
    nodes.forEach(function (n) {
      n.level -= minl
    })
    */
    return {
      nodes: nodes,
      edges: this.props.links.map(function (link) {
        return {
          from: link[0],
          to: link[1]
        }
      })
    }
  },
  componentDidMount: function () {
    if (!Object.keys(this.props.nodes).length) return
    var node = this.getDOMNode()
      , b = node.getBoundingClientRect()
    this.props.options.width = b.width + 'px'
    this.props.options.height = b.height + 'px'
    window.graph = this.graph = new vis.Graph(node, this.visData(), this.props.options)
    this.graph.on('click', function (e) {
      this.props.onClick(e)
    }.bind(this))
  },
  componentDidUpdate: function () {
    // this.graph.setData(this.visData())
    var node = this.getDOMNode()
      , b = node.getBoundingClientRect()
    this.props.options.width = b.width + 'px'
    this.props.options.height = b.height + 'px'
    window.graph = this.graph = new vis.Graph(node, this.visData(), this.props.options)
    this.graph.on('click', function (e) {
      this.props.onClick(e)
    }.bind(this))
  },
  render: function () {
    return d.div({className: 'mod-tree'})
  },
})

