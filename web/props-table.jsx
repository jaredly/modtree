/** @jsx React.DOM */

function valueToStr(value) {
  switch (typeof value) {
    case 'function':
      return (
        <span className='mod-html_props-table_fn'>{'<function>'}</span>
      )
    case 'object':
      return (
        <span className='mod-html_props-table_obj'>{JSON.stringify(value, null, 2)}</span>
      )
    case 'string':
      return (
        <span className='mod-html_props-table_str'>{JSON.stringify(value, null, 2)}</span>
      )
    case 'number':
      return (
        <span className='mod-html_props-table_num'>{value}</span>
      )
    default:
      return (
        <span className='mod-html_props-table_misc'>{'' + value}</span>
      )
  }
}

var PropsTable = module.exports = React.createClass({
  displayName: 'PropsTable',
  render: function () {
    var props = this.props.props
      , isRouter = this.props.isRouter
    return (
      <table className='mod-html_props-table'>
        {
          Object.keys(props).map(function (name) {
            if (name[0] === '_') return false
            if (name === 'goTo' && isRouter) return false // from Router
            return (
              <tr key={name}>
                <td className='mod-html_props-table_prop'>{name}</td>
                <td className='mod-html_props-table_value'>{valueToStr(props[name])}</td>
              </tr>
            )
          })
        }
      </table>
    )
  }
})

// vim: set tabstop=2 shiftwidth=2 expandtab:

