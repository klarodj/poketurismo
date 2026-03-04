<?php
    include('inc/session.php');
    include('inc/connect.php');
    $page='Track Builder';
    // prendo i dati
    $name = $_POST['name'];
    $type = $_POST['type'];
    $lenght = $_POST['lenght'];
    $elevation = $_POST['elevation'];
    $surface = $_POST['surface'];
    $meteo = $_POST['meteo'];
    $trackId = $_POST['trackId'];
    $sectionAdd = $_POST['section'];
    $level = $_POST['level'];
    // se ci sono i dati di creazione e sono al primo giro
    if ($name && $type && $lenght && $elevation && $surface && $meteo){
        // creo la pista
        $sql="
            INSERT INTO tracks (name, type, lenght, elevation, surface, meteo)
            VALUES ('$name', $type, '$lenght', '$elevation', $surface, $meteo)
        ";
        $result = $db->query($sql);
        // prendo l'id appena creato
        $sql="
            SELECT id
            FROM tracks
            ORDER BY id DESC LIMIT 1
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $trackId = $row['id'];
    }
    // prelevo le sezioni standard
    $trackSections = array();
    $sql="
        SELECT * 
        FROM trackSections
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($trackSections,$row);
    }
    // se non sono al primo giro ma sto aggiungendo sezioni
    if ($_POST['trackId']){
        // prendo i dati della pista
        $sql="
            SELECT name , lenght
            FROM tracks
            WHERE id = $trackId
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $name = $row['name'];
        $lenght = $row['lenght'];
        // conto quante sezioni ci sono
        $sql="
            SELECT count(ord) as num
            FROM trackBuild
            WHERE track = $trackId
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $sections = $row['num']+1;
        // aggiungo la sezione
        if ($sectionAdd){
            $ord = $sections;
            $sql="
                INSERT INTO trackBuild (track, section, level, ord)
                VALUES ($trackId, $sectionAdd, $level, $ord)
            ";
            $result = $db->query($sql);
        }
        // carico le sezioni attuali
        $actualSections = array();
        $sql="
            SELECT ts.name as name, tb.level as level, tb.ord as ord
            FROM trackBuild as tb INNER JOIN trackSections as ts ON tb.section = ts.id
            WHERE track = $trackId
        ";
        $result = $db->query($sql);
        while($row = $result->fetch_assoc()){
            array_push($actualSections,$row);
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Track Builder</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <p>Track: <?php echo $name.' Id:'.$trackId; ?> </p><br>
                    <p>Lenght: <?php echo $lenght; ?> Actual sections: <?php echo $sections; ?> </p><br>
                    <p>Sections:</p>
                    <table class="text-center mb-2" style="width:100%">
                        <tr>
                            <th class="status-bar-field">Section</th>  
                            <th class="status-bar-field">Level</th>
                            <th class="status-bar-field">Order</th>
                        </tr>
                        <?php 
                            foreach ($actualSections as $actualSection){
                                echo "<tr>";
                                echo "<td class=\"status-bar-field\">".$actualSection['name']."</td>";
                                echo "<td class=\"status-bar-field\">".$actualSection['level']."</td>";
                                echo "<td class=\"status-bar-field\">".$actualSection['ord']."</td>";
                                echo "</tr>";
                            }
                        ?>
                    </table>
                    <form action="trackBuild.php" method="POST">
                        <label for="section">Choose a Section:</label>
                        <select name="section" id="section" required>
                        <?php
                            foreach($trackSections as $section){
                                echo "<option value=\"".$section['id']."\">".ucfirst($section['name'])." | ".ucfirst($section['carStat'])." | ".ucfirst($section['carTech'])." | ".ucfirst($section['driverStat'])." | ".ucfirst($section['driverTech'])."</option>";
                            }
                        ?>
                        </select><br>
                        <label for="level">Level:</label>
                        <input type="text" name="level" id="level" value="1"><br>
                        <input type="hidden" name="trackId" id="trackId" value="<?php echo $trackId; ?>">
                    <?php
                        // se ho inserito tutte le sezioni
                        if($sections == $lenght){
                    ?>
                    </form>
                    <button class="mt-2" onclick="location.href='setting.php'">Exit</button>
                    <?php 
                        }else{
                    ?>
                        <button class="mt-2" type="submit">Add Section</button>
                    </form>
                    <?php 
                        }
                    ?>
                </div>
            </div>
        </div>
    </main>

    <?php include('inc/phone.php') ?>
    
    <?php include('inc/nav.php'); ?>
      
    <?php include('inc/script.php'); ?>

    <?php $db->close(); ?>
</body>
</html>