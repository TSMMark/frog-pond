Matches = new Mongo.Collection("matches");

Models = {}
Components = {}

var matchStub = {
  _id: 1,
  // Starting Board
  tiles: {
    "0,0": { occupant: 1 },
    "0,1": {},
    "0,2": {},
    "1,0": {},
    "1,1": {},
    "1,2": {},
    "2,0": {},
    "2,1": {},
    "2,2": { occupant: 2 }
  }
}

Models.Match = function (match) {
  this.match = match;
  this.tiles = this.initializeTiles();
}

Models.Match.prototype.initializeTiles = function () {
  var tiles = this.match.tiles;
  return Object.keys(tiles).map(function (key) {
    var tileData = tiles[key]
      , coordinates = Models.GameTile.keyToCoordinates(key)
      , props = _.extend({}, tileData, coordinates);

    return new Models.GameTile(props);
  });
}

Models.GameTile = function (props) {
  this.props = props;
}

Models.GameTile.keyToCoordinates = function (key) {
  var split = key.split(",");
  return { x: parseInt(split[0]), y: parseInt(split[1]) };
}

Models.GameTile.prototype.key = function () {
  return this.props.x + "," + this.props.y;
}

if (Meteor.isClient) {
  Meteor.subscribe("matches");

  Meteor.startup(function () {
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
            })

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
      render: function () {
        var match = this.props.match
          , countXTiles = 3
          , countYTiles = 3
          , boardWidth = window.innerWidth
          , boardHeight = window.innerHeight
          , maxTileWidth = boardWidth / countXTiles
          , maxTileHeight = boardHeight / countYTiles
          , size = Math.min(maxTileWidth, maxTileHeight)
          , style = {
              marginLeft: (size * countXTiles / -2) + "px",
              marginTop: (size * countYTiles / -2) + "px"
            }
          , gameTiles = match.tiles.map(function (tile) {
              return <Components.BoardTile tile={tile} size={size} key={tile.key()} />
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

    var render = function() {
      // var allMatches = Matches.find({}, {sort: {updatedAt: -1}});
      // React.render(<GameBoard matches={allMatches} />, document.getElementById("main-app"));
      var match = new Models.Match(matchStub);
      React.render(<Components.GameBoard match={match} />, document.getElementById("main-app"));
    }

    Deps.autorun(render);
    $(window).resize(_.throttle(render, 100));
  });
}

if (Meteor.isServer) {
  Meteor.publish("matches", function () {
    return Matches.find();
  });
}
