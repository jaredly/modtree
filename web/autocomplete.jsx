/** @jsx React.DOM */

var AutoComplete = module.exports = React.createClass({
  displayName: 'AutoComplete',
  getInitialState: function () {
    return {
      text: this.props.initialValue,
      focused: false
    }
  },
  onBlur: function () {
    this.setState({focused: false})
  },
  onFocus: function () {
    this.setState({focused: true})
  },
  componentDidUpdate: function () {
    this.refs.list.getDOMNode().scrollTop = 0
  },
  getCompletions: function () {
    var mains = []
      , subs = []
      , needle = this.state.text.toLowerCase().trim()
      , item
    if (!needle) return this.props.completions
    for (var i=0; i<this.props.completions.length; i++) {
      item = this.props.completions[i]
      if (item.title.toLowerCase().indexOf(needle) !== -1) {
        mains.push(item)
      } else if (item.subtitle.toLowerCase().indexOf(needle) !== -1) {
        subs.push(item)
      }
    }
    return mains.concat(subs)
  },
  onChange: function (e) {
    this.setState({text: e.target.value})
  },
  onSelect: function (what) {
    this.props.onSelect(what)
    this.setState({
      focused: false,
      text: ''
    })
    this.refs.input.getDOMNode().blur()
  },
  render: function () {
    var items = this.getCompletions()
      , action = this.onSelect
    return (
      <div className={'autocomplete' + (this.state.focused ? ' autocomplete--on' : '')}>
        <input
          className='autocomplete_input'
          ref='input'
          value={this.state.text}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.onChange}
          placeholder='Autocomplete'/>
        <ul className='autocomplete_list' ref='list'>
          {
            items.map(function (item) {
              return (
                <li className='autocomplete_item'
                    key={item.id}
                    onMouseDown={function(e){e.preventDefault()}}
                    onClick={action.bind(null, item)}>
                  <div className='autocomplete_title'>{item.title}</div>
                  <div className='autocomplete_subtitle'>{item.subtitle}</div>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
})

// vim: set tabstop=2 shiftwidth=2 expandtab:

