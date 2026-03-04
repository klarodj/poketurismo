<?php
    session_start(); // Starting Session
    include('connect.php');
    $error=''; // Variable To Store Error Message
    if (isset($_POST['submit'])) {
        if (empty($_POST['username']) || empty($_POST['password'])) {
            $error = "Inserire Username e Password.";
        }
        else
        {
            // Define $username and $password
            $username=$_POST['username'];
            $password=$_POST['password'];
            //$remember=$_POST['remember'];
            $remember=1;
            $last = date("d-m-Y G:i:s",time());
            // SQL query to fetch information of registerd users and finds user match.
            $rowtmp = $db->Execute("select * from cr_cat_login where password='$password' AND username='$username'");
            $rows = $rowtmp->numRows();
            if ($rows == 1) {
                $_SESSION['login_user']=$username; // Initializing Session
                $_SESSION['remember']=$remember;
                $_SESSION['subcat']=$rowtmp->fields['subcat'];
                setcookie('my_remember',$_POST['remember'],0, "/");//imposto il cookie per ricordare
                $last_login = $rowtmp->fields['last'];
                if(is_null($last_login)||$last_login==""){
                    $_SESSION['nuovo']="1";
                }else{
                    $_SESSION['nuovo']="0";
                }
                header("location: ../scegli.php"); // Redirecting To Other Page
                $rowtmp = $db->Execute("update cr_cat_login set last='$last' where username='$username'"); //Set last time login
            } else {
                $error = "Username o Password errati.";
            }
            $db->close(); // Closing Connection
        }
    }
?>