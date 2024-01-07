// Implementation of access token posting to the parent window (main client app).
// This page serves as the redirect target from our auth redirect server.

import React, { useEffect } from "react";

import * as AuthSession from "expo-auth-session";
import { WEB_ORIGIN } from "../utils/client";

const PostAuthMessagePostScreen = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const origin = AuthSession.makeRedirectUri({ path: "/" });

    const scope = urlParams.get("scope");
    const payload = urlParams.get("payload");

    if (!payload) {
      console.error("No payload found in url params");
    }

    if (payload && window.opener) {
      window.opener.postMessage({ payload, scope }, origin);
      window.close();
    }
  }, []);

  return (
    <div>
      <h1>Redirecting to {WEB_ORIGIN}...</h1>
    </div>
  );
};

export default PostAuthMessagePostScreen;
