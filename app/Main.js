import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";
Axios.defaults.baseURL =
  process.env.BACKENDURL || "https://raul26-react-for-all.herokuapp.com";

// My Contexts
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// My components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";

const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
const Chat = React.lazy(() => import("./components/Chat"));

import LoadingDotsIcon from "./components/LoadingDotsIcon";
const Search = React.lazy(() => import("./components/Search"));

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexAppToken"),
      username: localStorage.getItem("complexAppUsername"),
      avatar: localStorage.getItem("complexAppAvatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case "logout":
        draft.loggedIn = false;
        break;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        break;
      case "openSearch":
        draft.isSearchOpen = true;
        break;
      case "closeSearch":
        draft.isSearchOpen = false;
        break;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        break;
      case "closeChat":
        draft.isChatOpen = false;
        break;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        break;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  useEffect(() => {
    const { token, username, avatar } = state.user;
    if (state.loggedIn) {
      localStorage.setItem("complexAppToken", token);
      localStorage.setItem("complexAppUsername", username);
      localStorage.setItem("complexAppAvatar", avatar);
    } else {
      localStorage.removeItem("complexAppToken");
      localStorage.removeItem("complexAppUsername");
      localStorage.removeItem("complexAppAvatar");
    }
  }, [state.loggedIn]);

  // CHeck if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/checkToken",
            {
              token: state.user.token,
            },
            { cancelToken: ourRequest.token }
          );
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({
              type: "flashMessage",
              value: "Your session has expired. Please login again.",
            });
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled.");
        }
      }
      fetchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path="/profile/:username/*" element={<Profile />} />
              <Route
                path="/"
                element={state.loggedIn ? <Home /> : <HomeGuest />}
              />
              <Route path="/post/:id" element={<ViewSinglePost />} />
              <Route path="/post/:id/edit" element={<EditPost />} />
              <Route path="/create-post" element={<CreatePost />}></Route>
              <Route path="/about-us" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
