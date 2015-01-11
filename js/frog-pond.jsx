if (Meteor.isClient) {
  Meteor.startup(function () {
    var routes = (
      <Route name="app" path="/" handler={Views.App}>
        <Route name="play" handler={Views.NewGame}/>
        <Route name="playMatch" path="play/:matchId" handler={Views.PlayMatch}/>
        <DefaultRoute handler={Views.Home}/>
      </Route>
    );

    render = function () {
      Meteor.subscribe("matches", Meteor.userId());
      Meteor.subscribe("users");

      Router.run(routes, Router.HistoryLocation, function (Handler) {
        React.render(<Handler/>,
                     document.getElementById("main-app"));
      });
    }

    Deps.autorun(render);

    $(window).resize(_.throttle(render, 600));
  });
}

if (Meteor.isServer) {
  Meteor.publish("matches", function (userId) {
    return Collections.Matches.find({"playersIds": userId});
  });

  Meteor.publish("users", function () {
    return Collections.Users.find();
  });
}
