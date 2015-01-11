Models.Match = function (props) {
  this._id = props._id;
  this.tiles = Models.GameTile.newList(props.tiles);
}

// @option players [Array]
// @option currentPlayerId [Integer]
// @option dimensions [Object] - {x, y}
// @return [String] - _id of the inserted match
Models.Match.create = function (options) {
  var width = options.dimensions.x
    , height = options.dimensions.y
    , tiles = this.generateTiles(width, height);

  tiles[0].props.occupant = options.players[0]._id;
  tiles[width * height - 1].props.occupant = options.players[1]._id;

  var id = Collections.Matches.insert({
    tiles: tiles.map(function (gameTile) {
      return gameTile.props;
    }),
    currentPlayerId: options.currentPlayerId,
    players: options.players
  });

  return id;
}

Models.Match.findById = function (id) {
  var record = Collections.Matches.findOne(id);
  if (!record) {
    throw new Models.MissingRecordError();
  }
  return new this(record);
}

Models.Match.generateTiles = function (width, height) {
  var x, y
    , tiles = [];

  for (y = 0; y < width; y ++) {
    for (x = 0; x < height; x ++) {
      tiles.push({x: x, y: y, key: x + (y * height)});
    }
  }

  tiles = Models.GameTile.newList(tiles);

  return tiles;
}

Models.Match.prototype.totalArea = function () {
  var x = { min: 0, max: undefined }
    , y = { min: 0, max: undefined };

  this.tiles.forEach(function (tile) {
    var tileX = tile.props.x + 1
      , tileY = tile.props.y + 1;

    if (x.min === undefined || tileX < x.min) x.min = tileX;
    if (y.min === undefined || tileY < y.min) y.min = tileY;
    if (x.max === undefined || tileX > x.max) x.max = tileX;
    if (y.max === undefined || tileY > y.max) y.max = tileY;
  });

  return { width: x.max - x.min, height: y.max - y.min };
}
