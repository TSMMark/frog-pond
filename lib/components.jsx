Components = {};

Components.BoardTile = React.createClass({
  getInitialState: function () {
    return {
      hover: false
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
          hover: this.state.hover
        });

    return (
      <div className="game-lily-wrapper" style={wrapperStyle}>
        <div className={lilyClassSet}
             data-occupant-skin={occupantSkin}
             onMouseOver={this.onMouseOver}
             onMouseOut={this.onMouseOut}>
          <div className="lily-occupant"></div>
        </div>
      </div>);
  },

  onMouseOver: function (_event) {
    this.setState({ hover: true })
  },

  onMouseOut: function (_event) {
    this.setState({ hover: false })
  },

  getCoordinates: function () {
    return { x: this.props.tile.props.x, y: this.props.tile.props.y };
  }
});

Components.GameBoard = React.createClass({
  getMatch: function () {
    return this.props.match;
  },

  render: function () {
    var match = this.getMatch()
      , totalArea = match.totalArea()
      , boardWidth = window.innerWidth
      , boardHeight = window.innerHeight
      , maxTileWidth = boardWidth / totalArea.width
      , maxTileHeight = boardHeight / totalArea.height
      , size = Math.min(maxTileWidth, maxTileHeight)
      , style = {
          marginLeft: (size * totalArea.width / -2) + "px",
          marginTop: (size * totalArea.height / -2) + "px"
        }
      , gameTiles = match.tiles.map(function (tile) {
          return <Components.BoardTile tile={tile} size={size} key={tile.props.key} />
        });

    return (
      <div className="game-board">
        <div className="game-perspective">
          <div className="game-tiles" style={style}>
            {gameTiles}
          </div>
        </div>
      </div>);
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
        Play against {this.props.player.name}
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