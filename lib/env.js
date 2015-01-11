if (Meteor.isServer) {
  // Make sure we have all the required env variables.
  "FB_APP_ID FB_APP_SECRET".
    split(" ").forEach(function (name) {
      if (!_.has(process.env, name)) {
        throw "ENV missing variable: " + name + "";
      }
    });
}
