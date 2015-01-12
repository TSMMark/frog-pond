if (Meteor.isClient) {
  Meteor.startup(function () {
    render = function () {
      var currentUser = Meteor.user()
        , subRoutes
        , routes;

        if (currentUser) {
          subRoutes = [
            (<Route name="play" handler={Views.NewGame}/>),
            (<Route name="playMatch" path="play/:matchId" handler={Views.PlayMatch}/>),
            (<DefaultRoute handler={Views.Home}/>)
          ];
        }
        else {
          subRoutes = <DefaultRoute handler={Views.SignIn}/>;
        }

        routes = (
          <Route name="app" path="/" handler={Views.App}>
            {subRoutes}
          </Route>
        );

      if (currentUser) {
        Meteor.subscribe("matches", currentUser._id);
      }

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
