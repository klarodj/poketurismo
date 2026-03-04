<?php
    $servername = "localhost";
    $username = "id20443522_poketuri_db_usr";
    $password = "Am3l14!091220";
    $database = "id20443522_poketuri_db";

    // Create connection
    $db = new mysqli($servername, $username, $password, $database);

    // Check connection
    if ($db->connect_error) {
        die("Connection failed: " . $db->connect_error);
    }
?>