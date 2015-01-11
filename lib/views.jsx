Views = {};

Views.App = React.createClass({
  render: function () {
    return (
      <div>
        <Partials.Navbar/>
        <div id="main-content">
          <RouteHandler/>
        </div>
      </div>
    );
  }
});

Views.NotFound = React.createClass({
  getDefaultProps: function () {
    return {
      message: "Oops! Something went wrong.",
      submessage: "We couldn't find what you were looking for."
    }
  },

  render: function () {
    return (
      <Components.Container>
        <h1>{this.props.message}</h1>
        <h2>{this.props.submessage}</h2>
        <Link to="play" className="btn btn-default">Go Back</Link>
      </Components.Container>
    );
  }
});

Views.Home = React.createClass({
  render: function () {
    return (
      <Components.Container>
        <h1>Welcome to Sinky Frog</h1>
        <Link to="play" className="btn btn-primary btn-lg">Start a New Match</Link>
      </Components.Container>
    );
  }
});

Views.NewGame = React.createClass({
  listPlayers: function () {
    var allPlayers = [{
      _id: 1,
      profile: {
        name: "Mark Allen"
      }
    }, {
      _id: 2,
      profile: {
        name: "Chloe Echikson"
      }
    }];

    return allPlayers.map(function (player) {
      return (
        <li key={player._id} className="list-group-item">
          <Components.NewGameButton player={player} currentPlayer={allPlayers[0]}/>
        </li>);
    });
  },

  render: function () {
    return (
      <Components.Container>
        <h1>Start a new match with...</h1>
        <ul className="list-group">
          {this.listPlayers()}
        </ul>
      </Components.Container>
    );
  }
});

Views.PlayMatch = React.createClass({
  mixins: [Router.State, Router.Navigation],

  render: function () {
    var matchId = this.getParams().matchId
      , match;

    try {
      match = Models.Match.findById(matchId);
    } catch (e) {
      return (<Views.NotFound/>);
    }

    return (
      <Components.Container>
        <Components.GameBoard match={match}/>
      </Components.Container>);
  }
});
