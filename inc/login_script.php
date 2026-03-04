<?php
    session_start(); // Starting Session
    include('connect.php');
    $error=''; // Variable To Store Error Message
    if (isset($_POST['submit'])) {
        if (empty($_POST['username']) || empty($_POST['password'])) {
            $error = "Please insert username and password!";
        }
        else
        {   
            // Define $username and $password
            $username=$_POST['username'];
            $password=$_POST['password'];
            //$remember=$_POST['remember'];
            $remember=1;
            $last = date("Y-m-d H:i:s");
            // SQL query to fetch information of registerd users and finds user match.
            $sql="
                SELECT * 
                FROM users 
                WHERE username='$username' AND password='$password'
            ";
            $result = $db->query($sql);
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $_SESSION['userLogin']=$username; // Initializing Session
                $_SESSION['remember']=$remember;
                //setcookie('my_remember',$_POST['remember'],0, "/");//imposto il cookie per ricordare
                setcookie('my_remember',$remember,0, "/");
                $last_login = $row['lastLogin'];
                if(is_null($last_login)||$last_login==""){
                    $_SESSION['nuovo']="1";
                }else{
                    $_SESSION['nuovo']="0";
                }
                header("location: ../main.php"); // Redirecting To Other Page
                // set last login
                $sql="
                    UPDATE users
                    SET lastLogin='$last'
                    WHERE username='$username'
                ";
                $result = $db->query($sql);
            } else {
                $error = "Not valid username or password!";
            }
            $db->close(); // Closing Connection
        }
    }
?>