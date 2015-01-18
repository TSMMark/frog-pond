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

Views.SignIn = React.createClass({
  render: function () {
    return (
      <Components.Container>
        <div className="jumbotron">
          <h1>Sinky Frog</h1>
          <h2>Play the new addicting game with your friends.</h2>
          <Components.FacebookLogin/>
        </div>
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
        <button className="btn btn-danger btn-sm"
                onClick={this.clearAllMatches}>
          Clear all games
        </button>
      </Components.Container>
    );
  },

  clearAllMatches: function () {
    var msg = "Really clear all your matches? Can't undo.";
    if (confirm(msg)) {
      Meteor.call("removeAllUserMatches");
    }
  }
});

Views.NewGame = React.createClass({
  listPlayers: function () {
    var currentUser = Meteor.user()
      , otherUsers = Collections.Users.find({ _id: { $not: currentUser._id } });

    return otherUsers.map(function (player) {
      return (
        <li key={player._id} className="list-group-item">
          <Components.NewGameButton player={player} currentPlayer={currentUser} />
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
      , match
      , width
      , height;

    try {
      match = Models.Match.findById(matchId);
    } catch (e) {
    }

    if (!match) return (<Views.NotFound/>);

    width = window.innerWidth - 24;
    height = window.innerHeight - 64;

    return (
      <Components.Container>
        <Components.GameBoard match={match} width={width} height={height}/>
      </Components.Container>);
  }
});

Views.ConfigureServices = React.createClass({
  mixins: [Router.State, Router.Navigation],

  render: function () {
    return (
      <Components.Container>
        <form onSubmit={this.handleSubmit}>
          <p>Enter the Facebook app data:</p>
          <label htmlFor="app_id">app_id</label>
          <input type="text" ref="app_id" id="app_id" name="app_id" />
          <label htmlFor="app_secret">app_secret</label>
          <input type="text" ref="app_secret" id="app_secret" name="app_secret" />
          <input type="submit" className="btn btn-default" />
        </form>
      </Components.Container>);
  },

  handleSubmit: function (event) {
    event.preventDefault();
    var app_id = this.refs.app_id.getDOMNode().value
      , app_secret = this.refs.app_secret.getDOMNode().value

    ServiceConfiguration.configurations.insert({
      service: "facebook",
      appId: app_id,
      secret: app_secret
    });
  }
});
