Matches = new Mongo.Collection("matches");

Models = {}
Components = {}

generateTiles = function (width, height) {
  var x, y
    , tiles = {};

  for (x = 0; x < width; x ++) {
    for (y = 0; y < height; y ++) {
      tiles[x + "," + y] = {};
    }
  }

  tiles["0,0"].occupant = 1;
  tiles[(width - 1) + "," + (height - 1)].occupant = 2;

  return tiles;
}

matchStub = {
  _id: 1,
  // Starting Board
  tiles: generateTiles(4, 4),

  // Complex Boards
  // tiles: generateTiles(7, 7)

  // tiles: {
  //   "0,0": { occupant: 1 },
  //   "2,2": { occupant: 2 }
  // }

  // tiles: {
  //   "0,0": { occupant: 1 },
  //   "5,5": { occupant: 2 }
  // }

  // TODO: Center the board.
  // tiles: {
  //   "4,6": { occupant: 1 },
  //   "9,3": { occupant: 2 }
  // },

  // tiles: {
  //   "1,1": { occupant: 1 },
  //   "3,3": { occupant: 2 }
  // }
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

Models.Match.prototype.totalArea = function () {
  var x = { min: 0, max: undefined }
    , y = { min: 0, max: undefined };

  this.tiles.forEach(function (tile) {
    var tileX = tile.x + 1
      , tileY = tile.y + 1;

    if (x.min === undefined || tileX < x.min) x.min = tileX;
    if (y.min === undefined || tileY < y.min) y.min = tileY;
    if (x.max === undefined || tileX > x.max) x.max = tileX;
    if (y.max === undefined || tileY > y.max) y.max = tileY;
  });

  return { width: x.max - x.min, height: y.max - y.min };
}

Models.GameTile = function (props) {
  this.x = props.x;
  this.y = props.y;
  this.occupant = props.occupant;
}

Models.GameTile.keyToCoordinates = function (key) {
  var split = key.split(",");
  return { x: parseInt(split[0]), y: parseInt(split[1]) };
}

Models.GameTile.prototype.key = function () {
  return this.x + "," + this.y;
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
          , occupantSkin = this.props.tile.occupant // TODO get skin from player's settings.
          , wrapperStyle = {
              left: (coords.x * this.props.size) + "px",
              top: (coords.y * this.props.size) + "px",
              width: this.props.size + "px",
              height: this.props.size + "px"
            }
          , lilyClassSet = React.addons.classSet({
              "lily-square": true,
              "with-occupant": !!this.props.tile.occupant,
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
        return { x: this.props.tile.x, y: this.props.tile.y };
      }
    });

    Components.GameBoard = React.createClass({
      render: function () {
        var match = this.props.match
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

    setTiles = function (tiles) {
      matchStub.tiles = tiles;
      render();
    }

    // To show instant re-render.
    setBoardSize = function (width, height) {
      setTiles(generateTiles(width, height));
    }

  });
}

if (Meteor.isServer) {
  Meteor.publish("matches", function () {
    return Matches.find();
  });
}
