
/*
React.renderComponent(modtree.VisTree({
  nodes: data.nodes,
  links: data.links,
  options: {
    edges: {
      style: 'arrow'
    },
    hierarchicalLayout: {
      direction: 'UD'
    }
  }
}), document.getElementById('main'))
*/

var nodes = {}
  , comp
  , cc
for (var name in data.nodes) {
  comp = components[name]
  if (!comp) continue
  cc = comp.cls.componentConstructor
  cp = cc.prototype

  nodes[name] = {
    deps: [],
    displayName: cc.displayName,
    router: !!cp.routes,
    model: !!cp.model,
    routes: cp.routes,
    defaultProps: cp.getDefaultProps ? cp.getDefaultProps() : {},
    fixtures: comp.fixtures
  }
}
data.links.forEach(function (link) {
  if (!nodes[link[0]] || !nodes[link[1]]) return
  nodes[link[0]].deps.push(link[1])
})

React.renderComponent(modtree.ModTree({
  nodes: nodes,
}), document.getElementById('html'))

