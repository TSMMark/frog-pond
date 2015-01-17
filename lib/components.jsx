Components = {};

Components.BoardTile = React.createClass({
  mixins: [HammerMixin],

  getInitialState: function () {
    return {
      hover: false
    }
  },

  hammer: function () {
    return {
      self: {
        recognizer: "pan",
        set: {
          direction: Hammer.DIRECTION_ALL
        }
      }
    }
  },

  render: function () {
    var coords = this.getCoordinates()
      , occupantSkin = this.props.tile.props.occupant // TODO get skin from player's settings.
      , wrapperStyle = {
          left: (coords.x * this.props.size) + "px",
          top: (coords.y * this.props.size) + "px",
          width: this.props.size + "px",
          height: this.props.size + "px"
        }
      , lilyClassSet = React.addons.classSet({
          "lily-square": true,
          "with-occupant": !!this.props.tile.props.occupant,
          hover: this.state.hover,
          grab: this.state.grab
        });

    return (
      <div ref="self" className="game-lily-wrapper"
           style={wrapperStyle}>
        <div className={lilyClassSet}
             data-occupant-skin={occupantSkin}
             onMouseOver={this.onMouseOver}
             onMouseOut={this.onMouseOut}
             onMouseDown={this.onMouseDown}
             onMouseUp={this.onMouseUp}>
          <div className="lily-occupant"></div>
        </div>
      </div>);
  },

  handlePan: function (event) {
    var direction = this.parseHammerEventDirection(event.direction);

    if (!direction) return;

    if (event.isFinal) {
      console.log("pan", direction, event);
      this.props.onPan(direction, this.props.tile);
    }
  },

  parseHammerEventDirection: function (hammerDirection) {
    switch (hammerDirection) {
      case Hammer.DIRECTION_NONE:  return 0;
      case Hammer.DIRECTION_UP:    return 1;
      case Hammer.DIRECTION_RIGHT: return 2;
      case Hammer.DIRECTION_DOWN:  return 3;
      case Hammer.DIRECTION_LEFT:  return 4;
    }
  },

  onMouseOver: function (_event) {
    this.setState({ hover: true });
  },

  onMouseOut: function (_event) {
    this.setState({ hover: false, grab: false });
  },

  onMouseDown: function (_event) {
    this.setState({ grab: true });
  },

  onMouseUp: function (_event) {
    this.setState({ grab: false });
  },

  getCoordinates: function () {
    return { x: this.props.tile.props.x, y: this.props.tile.props.y };
  }
});

Components.GameBoard = React.createClass({
  render: function () {
    var self = this
      , match = self.props.match
      , totalArea = match.totalArea()
      , boardWidth = self.props.width
      , boardHeight = self.props.height
      , maxTileWidth = boardWidth / totalArea.width
      , maxTileHeight = boardHeight / totalArea.height
      , size = Math.min(maxTileWidth, maxTileHeight)
      , style = {
          marginLeft: (size * totalArea.width / -2) + "px",
          marginTop: (size * totalArea.height / -2) + "px"
        }
      , gameTiles = match.tiles.map(function (tile) {
          return <Components.BoardTile tile={tile} size={size} key={tile.props.key}
            onPan={self.onPanTile} />
        });

    return (
      <div className="game-board">
        <div className="game-perspective">
          <div className="game-tiles" style={style}>
            {gameTiles}
          </div>
        </div>
      </div>);
  },

  panDirectionFunctionMap: {
    1: "shiftUp",
    2: "shiftRight",
    3: "shiftDown",
    4: "shiftLeft"
  },

  // @param directionCode [Integer] top 1, right 2, bottom 3, left 4
  // @param pannedTile [Components.BoardTile]
  onPanTile: function (directionCode, pannedTile) {
    var panFunction = this.panDirectionFunctionMap[directionCode];
    this.props.match[panFunction](pannedTile);
  }
});

Components.Container = React.createClass({
  render: function () {
    return (<div className="container">
              {this.props.children}
            </div>);
  }
});

Components.NewGameButton = React.createClass({
  mixins: [Router.Navigation],

  render: function () {
    return (
      <button onClick={this.startNewMatch}
         className="btn btn-default">
        Play with {this.props.player.profile.name}
      </button>);
  },

  startNewMatch: function () {
    var currentPlayer = this.props.currentPlayer
      , matchId = Models.Match.create({
          players: [currentPlayer, this.props.player],
          currentPlayerId: currentPlayer._id,
          dimensions: {x: 4, y: 4}
        });
    this.transitionTo("playMatch", {matchId: matchId});
  }
});

Components.FacebookLogin = React.createClass({
  render: function () {
    if (this.props.currentUser) {
      return (
        <button onClick={this.signOut}
                className="btn btn-default">
          <span className="fa fa-power-off"></span>
        </button>);
    }
    else {
      return (
        <button onClick={this.signIn}
           className="btn btn-facebook">
          Sign in with Facebook
        </button>);
    }
  },

  signIn: function (event) {
    event.preventDefault();
    Meteor.loginWithFacebook({
      requestPermissions: ['email']
    }, function (error) {
      Meteor._debug("FacebookLogin", error);
      if (error) throw error;
    });
  },

  signOut: function (event) {
    event.preventDefault();
    Meteor.logout(function (error) {
      Meteor._debug("Logout", error);
      if (error) throw error;
    });
  }
});

Components.ExistingMatchesList = React.createClass({
  render: function () {
    var currentUser = this.props.currentUser
      , matchesComponents = this.props.matches.map(function (match) {
          var opponents = match.players.filter(function (player) {
                return player._id != currentUser._id;
              })
            , opponentsNames = opponents.map(function (opponent) {
                return opponent.profile.name;
              });

          return (
            <Link to="playMatch" params={{matchId: match._id}}
                  key={match._id} className="list-group-item">
              vs {opponentsNames.join(", ")} - Make your move
            </Link>);
        });

    return (
      <div className="list-group">
        {matchesComponents}
      </div>);
  }
});
