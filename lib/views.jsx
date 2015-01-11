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
    var currentUser = Meteor.user()
      , matches = Collections.Matches.find().fetch()
      , matchesByReadines = _.groupBy(matches, function (match) {
          return match.currentPlayerId == currentUser._id ? "true" : "false";
        })
      , matchesReady = (matchesByReadines["true"] || [])
      , matchesUnready = (matchesByReadines["false"] || [])
      , countMatchesReady = matchesReady.length
      , countMatchesUnready = matchesUnready.length;

    return (
      <Components.Container>
        <h1>Welcome to Sinky Frog</h1>
        <Link to="play" className="btn btn-primary btn-lg">Start a New Match</Link>
        <h2>
          It's your move in {countMatchesReady} of {matches.length} matches.
        </h2>
        <Components.ExistingMatchesList currentUser={currentUser}
          matches={matchesReady}/>
        <h2>Waiting on {countMatchesUnready} opponents.</h2>
        <Components.ExistingMatchesList currentUser={currentUser}
          matches={matchesUnready}/>
      </Components.Container>
    );
  }
});

Views.NewGame = React.createClass({
  listPlayers: function () {
    // var currentUserId = "ir6ZRhzSNtdc8GNAS"
    var currentUser = Meteor.user()
      , otherUsers = Collections.Users.find({_id: {$not: currentUser._id}});

    return otherUsers.map(function (player) {
      return (
        <li key={player._id} className="list-group-item">
          <Components.NewGameButton player={player} currentPlayer={currentUser}/>
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
