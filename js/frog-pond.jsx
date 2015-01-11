if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.subscribe("matches");

    var routes = (
      <Route name="app" path="/" handler={Views.App}>
        <Route name="play" handler={Views.NewGame}/>
        <Route name="playMatch" path="play/:matchId" handler={Views.PlayMatch}/>
        <DefaultRoute handler={Views.Home}/>
      </Route>
    );

    var render = function () {
      Router.run(routes, Router.HistoryLocation, function (Handler) {
        React.render(<Handler/>,
                     document.getElementById("main-app"));
      });
    }

    Deps.autorun(render);
    $(window).resize(_.throttle(render, 800));

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
    return Collections.Matches.find();
  });
}
