import { useSession } from "next-auth/react";
import { ReactNode, useState, useRef, useEffect, useMemo, FC } from "react";
import Styles from "./layout.module.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import { GlobalSettings } from "../../features/settings/GlobalSettings";
import { socket } from "~/socket";
import { PageTitle } from "~/modules/layout/components/pageTitle/pageTitle";
import { UnReadRooms } from "../../features/unreadRooms/unreadRooms";
import { LeftBar } from "../../features/leftBar/leftBar";
import { Content } from "../../features/content/content";
import { useAppSelector } from "~/hooks/redux";
import { Provider as ReduxProvider } from "react-redux";
import { setupStore } from "~/store/store";
import { userType } from "~/types/user";

interface LayoutI {
  content: ReactNode;
  top: ReactNode;
  right: ReactNode;
  title?: string | ((user: userType) => string);
}

export const Layout: FC<LayoutI> = ({ ...props }) => {
  const { data: sessionData } = useSession();
  const user = useMemo(() => {
    return sessionData
      ? {
          id: sessionData.user.id,
          uniqName: sessionData.user.name!,
          image: sessionData.user.image!,
          name: sessionData.user.name!,
        }
      : null;
  }, [sessionData]);

  const store = setupStore({
    global: {
      user,
    },
  });

  return (
    <ReduxProvider store={store}>
      <LayoutContent {...props} />
    </ReduxProvider>
  );
};

export const LayoutContent: FC<LayoutI> = ({ content, top, right, title = "dis" }) => {
  const settingsContainerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<HTMLDivElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const user = useAppSelector((state) => state.global.user);

  useEffect(() => {
    if (user) {
      const roomName = "user" + user.id;
      socket.connect();
      socket.emit("joinRoom", roomName);

      function onConnect() {
        console.log("connected");
      }

      function onDisconnect() {
        console.log("disconnected");
      }

      // function onFriendReqNotify() {
      //   setIsHaveReq(true);
      // }
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);

        socket.emit("leaveRoom", roomName);
        socket.disconnect();
      };
    }
  }, [user]);

  const [settingsContainer, setSettingsContainer] = useState(
    settingsContainerRef.current,
  );
  const [app, setApp] = useState(appRef.current);

  useEffect(() => {
    setSettingsContainer(settingsContainerRef.current);
    setApp(appRef.current);
  }, []);

  function appChangeTrue(appElement: HTMLDivElement) {
    appElement.style.transform = "scale(1)";
    appElement.style.opacity = "1";
  }

  function appChangeFalse(appElement: HTMLDivElement) {
    appElement.style.transform = "scale(0.8)";
    appElement.style.opacity = "0";
  }

  function appChange(v: boolean, appElement: HTMLDivElement) {
    if (v) {
      appChangeTrue(appElement);
    } else {
      appChangeFalse(appElement);
    }
  }
  function setSettingsContainerFalse(settingsContainerElement: HTMLDivElement) {
    settingsContainerElement.style.transform = "scale(1.2)";
    settingsContainerElement.style.opacity = "0";
  }

  function setSettingsContainerTrue(settingsContainerElement: HTMLDivElement) {
    settingsContainerElement.style.display = "block";
    setTimeout(() => {
      settingsContainerElement.style.transform = "scale(1)";
      settingsContainerElement.style.opacity = "1";
    }, 0);
  }

  function settingsContainerChange(
    v: boolean,
    settingsContainerElement: HTMLDivElement,
  ) {
    if (v) {
      setSettingsContainerFalse(settingsContainerElement);
    } else {
      setSettingsContainerTrue(settingsContainerElement);
    }
  }

  function turnOffContainer(settingsContainerElement: HTMLDivElement) {
    settingsContainerElement.style.display = "none";
    setIsSettingsOpen(false);
  }

  function turnOffContainerTime(
    time: number,
    settingsContainer: HTMLDivElement,
  ) {
    setTimeout(() => {
      turnOffContainer(settingsContainer);
    }, time);
  }

  function turnOnContainer() {
    setIsSettingsOpen(true);
  }

  function switchSettings(
    v: boolean,
    time: number,
    settingsContainerElement: HTMLDivElement,
  ) {
    if (v) {
      turnOffContainerTime(time, settingsContainerElement);
    } else {
      turnOnContainer();
    }
  }

  function toggleSettings() {
    if (settingsContainer && app) {
      appChange(isSettingsOpen, app);
      settingsContainerChange(isSettingsOpen, settingsContainer);
      switchSettings(isSettingsOpen, 200, settingsContainer);
    }
  }

  return (
    <div className={Styles.body}>
      <Blank />
      <PageTitle title={typeof title == 'string'  ?  title : title(user)} />
      {user && (
        <>
          <div className={Styles.app} ref={appRef}>
            <div className={Styles.slidebar} id="slidebar">
              <UnReadRooms />
            </div>
            <div className={Styles.self}>
              <LeftBar toggleSettingsF={toggleSettings} />
              <Content top={top} content={content} right={right} />
            </div>
          </div>

          <div
            className={Styles.global_settings_container}
            ref={settingsContainerRef}
          >
            {isSettingsOpen && <GlobalSettings callBack={toggleSettings} />}
          </div>
        </>
      )}
    </div>
  );
};

const Blank: FC = () => {
  return (
    <div className={Styles.blank}>
      <div className={Styles.nav}></div>
      <div className={Styles.left}></div>
      <div className={Styles.right}></div>
    </div>
  );
};
