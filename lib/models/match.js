Models.Match = function (props) {
  this._id = props._id;
  this.tiles = Models.GameTile.newList(props.tiles);
  this.players = props.players;
  this.playersIds = props.playersIds;
  // TODO remove
  window.match = this;
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

  var props = this.propsToRecord({
    tiles: tiles,
    currentPlayerId: options.currentPlayerId,
    players: options.players.map(function (player) {
      return _.pick(player, "_id", "profile");
    }),
    playersIds: options.players.map(function (player) {
      return player._id;
    })
  });

  var id = Collections.Matches.insert(props);

  return id;
}

Models.Match.propsToRecord = function (props) {
  return {
    tiles: props.tiles.map(function (gameTile) {
      return gameTile.props;
    }),
    currentPlayerId: props.currentPlayerId,
    players: props.players,
    playersIds: props.playersIds
  }
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

// Shift a row or a col.
//
// @param boardTiles [Array<Models.GameTile>]
// @param sliceNum [Integer] The index of the row or col.
// @param shiftDimension [String] "x" or "y".
// @param direction [Integer] The direction. Must be one or negative one.
Models.Match.shiftSlice = function (boardTiles, sliceNum, shiftDimension, direction) {
  var filterDimension = shiftDimension == "x" ? "y" : "x"
    , tiles = _.filter(boardTiles, function (tile) {
        return tile.props[filterDimension] == sliceNum;
      })
    , filter = Models.Match.filterShiftableTiles
    , shiftableTiles = filter(tiles, shiftDimension, direction);

  shiftableTiles.forEach(function (tile) {
    tile.props[shiftDimension] += direction;
  });
}

// @param tiles [Array<Models.GameTile>]
// @param dimension [String] "x" or "y".
// @param direction [Integer] The direction. Must be one or negative one.
Models.Match.filterShiftableTiles = function (tiles, dimension, direction) {
  var sortedTiles = tiles.sort(function (ta, tb) {
        return (ta.props[dimension] - tb.props[dimension]) * direction;
      })
    , shiftableTiles = []
    , i, t;

  for (i = 0, t = sortedTiles.length; i < t; i ++) {
    var ta = sortedTiles[i]
      , tb = sortedTiles[i + 1]
      , isConsecutive = tb && ta.props[dimension] + direction == tb.props[dimension];

    shiftableTiles.push(ta);

    if (!isConsecutive) {
      break;
    }
  }

  return shiftableTiles;
}

Models.Match.prototype.save = function () {
  var props = Models.Match.propsToRecord({
    tiles: this.tiles,
    currentPlayerId: this.currentPlayerId,
    players: this.players,
    playersIds: this.playersIds
  });

  Collections.Matches.update({_id: this._id}, {$set: props});

  render();
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

Models.Match.prototype.shiftUp = function (tile, direction) {
  this.shiftSlice(tile.props.x, "y", (direction || 1) * -1);
}

Models.Match.prototype.shiftRight = function (tile, direction) {
  this.shiftSlice(tile.props.y, "x", direction || 1);
}

Models.Match.prototype.shiftDown = function (tile, direction) {
  this.shiftSlice(tile.props.x, "y", direction || 1);
}

Models.Match.prototype.shiftLeft = function (tile, direction) {
  this.shiftSlice(tile.props.y, "x", (direction || 1) * -1);
}

// Shift a row or a col.
//
// @param sliceNum [Integer] The index of the row or col.
// @param shiftDimension [String] "x" or "y".
// @param direction [Integer] The direction. Must be one or negative one.
Models.Match.prototype.shiftSlice = function (sliceNum, shiftDimension, direction) {
  Models.Match.shiftSlice(this.tiles, sliceNum, shiftDimension, direction);
  this.save();
}
