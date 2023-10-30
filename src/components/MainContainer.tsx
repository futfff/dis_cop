import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React from 'react';
import  Styles  from "../styles/MainContainer.module.scss";
import ProfileBar from "~/components/profileBar";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { api } from "~/utils/api";
import { error } from "console";
import { array } from "zod";

export default function MainContainer( {content : Content , top : Top, right  : Right , title='dis' , tab=''}  :{content : React.FC  , top : React.FC<{}>, right: React.FC , title : string , tab :  string}  ) {
  const {data : sessionData } = useSession()
  let  {data  : userRooms }= api.rooms.userRooms.useQuery();
  if (!sessionData ){
    return (  <button onClick={()=> void signIn()}>signin </button> )
  }
  if  (!userRooms){
    userRooms = []
  }

  const user = { id: sessionData.user.id, name: sessionData.user.name || '[blank]', image: sessionData.user.image || '' }
  
  return (
    <>
    
      <Head>
        <title>{title}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=REM:wght@300&family=Raleway:wght@400;600&display=swap" rel="stylesheet"/>
      </Head>
        <div className={Styles.app}>
          <div className={Styles.slidebar} id="slidebar">
            <div className={Styles.unread_rooms}>

            </div>
          </div>
          <div className={Styles.self}>  
            <div className={Styles.self__leftbar}>
                <div className={[Styles.self__leftbar_top ,  Styles.top].join(' ')}>
                    
                </div>
                 
                <div className={Styles.my_rooms__bar} id="my_rooms">   
                    <div className={Styles.nav}>
                        <Link  href="/friends" className={tab === 'friends' ? Styles.tab : '' } >
                            <p>
                            <i className="bi bi-people-fill"></i>Друзья
                            </p>
                        </Link>     
                    </div>
                    <br />
                    <div className={Styles.my_rooms}>  
                        <label>личные сообщения</label>
                        {userRooms.map((room) => (
                            <Link  className={tab === 'room_' + room.id ? Styles.tab : ''  } href={'/channels/'+room.id} key={room.id}> 
                                <img src={room.type  == 'group'  ? '/img/grav.png' : room.members.map((u) => u.user).find((m) => m.id !== user.id)?.image} className={Styles.room_ava} />
                                <p>{ room.type  == 'group'  ? room.name : room.members.map((u) => u.user).find((m) => m.id !== user.id)?.name }</p>
                            </Link>
                        ))}
                    </div>
                </div>
                {/* <button onClick={() => void signOut()}>out</button> */}
                <ProfileBar user={user}></ProfileBar>         
                </div>
                <div className={Styles.self__content} id="self_content">
                <div className={[Styles.self__top , Styles.top].join(' ')}>
                    
                        <Top/>
                 
                </div>
                <div className={Styles.self__bot}>
                    <div className={Styles.self__self}>
                        <Content/>
                    </div>
                    <div className={Styles.self__rightbar}>
                        <Right/>
                    </div>
                </div>
            </div>
          </div>
        </div>
    </>
  );
}