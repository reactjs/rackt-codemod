import { PropTypes } from 'react-router'

class Tab extends React.Component {
  render() {
    const isActive = this.context.history.isActive({
      pathname: this.props.to,
      query: this.props.query
    }, this.props.onlyActiveOnIndex);

    const className = isActive ? 'active' : '';

    return <li className={className}><Link {...this.props} /></li>;
  }
}

Tab.contextTypes = { history: PropTypes.history };
