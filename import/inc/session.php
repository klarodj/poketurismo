<?php
    include('connect.php');
    session_start();// Starting Session
    if ($_SESSION['login_user'] && !isset($_COOKIE['my_remember']) && !$_SESSION['remember']) { //se messo Ricordami
        // Storing Session
        $user_check=$_SESSION['login_user'];
        // SQL Query To Fetch Complete Information Of User
        $row = $db->Execute("select id, username, cat_id, Rip_d_riparatore, iren, engie, estendo from cr_cat_login inner join uvwGRZ_riparatori on cr_cat_login.cat_id = uvwGRZ_riparatori.ItemID where username='$user_check'");
        $login_id =$row->fields['id'];
        $login_session =$row->fields['username'];
        $login_cat_id = $row->fields['cat_id'];
        $login_cat_rs = $row->fields['Rip_d_riparatore'];
        $login_cat_iren = $row->fields['iren'];
        $login_cat_engie = $row->fields['engie'];
        $login_cat_estendo = $row->fields['estendo'];
        if(!isset($login_session)){
            $db->close(); // Closing Connection
            header('Location: ../cat/index.php'); // Redirecting To Login Page
        }
        session_destroy();
    }else{ //se non messo Ricordami
        // Storing Session
        $user_check=$_SESSION['login_user'];
        // SQL Query To Fetch Complete Information Of User
        $row = $db->Execute("select id, username, cat_id, Rip_d_riparatore, iren, engie, estendo from cr_cat_login inner join uvwGRZ_riparatori on cr_cat_login.cat_id = uvwGRZ_riparatori.ItemID where username='$user_check'");
        $login_id =$row->fields['id'];
        $login_session =$row->fields['username'];
        $login_cat_id = $row->fields['cat_id'];
        $login_cat_rs = $row->fields['Rip_d_riparatore'];
        $login_cat_iren = $row->fields['iren'];
        $login_cat_engie = $row->fields['engie'];
        $login_cat_estendo = $row->fields['estendo'];
        if(!isset($login_session)){
            $db->close(); // Closing Connection
            header('Location: ../cat/index.php'); // Redirecting To Login Page
        }
    }
?>