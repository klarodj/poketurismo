<?php
    include('inc/session.php');
    $page='Tuning Parts';
    include('inc/connect.php');
    include('inc/main_class.php');
    $sections = array();
    $sql="
        SELECT name, category 
        FROM parts
        GROUP BY name 
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($sections,$row);
    }
    $parts = array();
    $sql="
        SELECT * 
        FROM parts
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($parts,$row);
    }
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Tuning Parts</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body big">
                    <section class="tabs">
                        <menu role="tablist" aria-label="Sample Tabs">
                            <button role="tab" aria-selected="true" aria-controls="tab-A">Engine</button>
                            <button role="tab" aria-controls="tab-B">Car Dynamics</button>
                        </menu>
                        <article role="tabpanel" id="tab-A">
                            <?php
                                foreach($sections as $section){
                                    if($section['category']=='Engine'){
                                        echo "<h4 class=\"mt-2\">".$section['name']."</h4>";
                            ?>
                            <table class="text-center" style="width:100%">
                                <tr>
                                    <th class="status-bar-field">Level</th>
                                    <th class="status-bar-field">Image</th>
                                    <th class="status-bar-field">Description</th>
                                    <th class="status-bar-field">Price</th>
                                    <th class="status-bar-field">Speed +</th>
                                    <th class="status-bar-field">Acceler. +</th>
                                    <th class="status-bar-field">Revving +</th>
                                    <th class="status-bar-field">Transmis. +</th>
                                    <th class="status-bar-field">Slow Turn +</th>
                                    <th class="status-bar-field">Fast Turn +</th>
                                    <th class="status-bar-field">Brake +</th>
                                    <th class="status-bar-field">Traction +</th>
                                    <th class="status-bar-field">CV +</th>
                                    <th class="status-bar-field">NM +</th>
                                    <th class="status-bar-field">KG -</th>
                                    <th class="status-bar-field">Buy</th>
                                </tr>
                            <?php
                                foreach($parts as $part){
                                    if($part['name']==$section['name']){
                                        echo "<tr>";
                                        echo "<td class=\"status-bar-field\">".$part['level']."</td>";
                                        echo "<td class=\"status-bar-field\"><img src=\"img/part/".$part['image']."\" class=\"partImage\"></td>";
                                        echo "<td class=\"status-bar-field\">".$part['description']."</td>";
                                        echo "<td class=\"status-bar-field\">".euroFormat($part['price'])."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['speedBonus']>0 ? percentFormat($part['speedBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['accelBonus']>0 ? percentFormat($part['accelBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['revvBonus']>0 ? percentFormat($part['revvBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['transBonus']>0 ? percentFormat($part['transBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['turnSlowBonus']>0 ? percentFormat($part['turnSlowBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['turnFastBonus']>0 ? percentFormat($part['turnFastBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['brakeBonus']>0 ? percentFormat($part['brakeBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['tractBonus']>0 ? percentFormat($part['tractBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['cvBonus']>0 ? percentFormat($part['cvBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['nmBonus']>0 ? percentFormat($part['nmBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['kgBonus']>0 ? percentFormat($part['kgBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\"><button onClick=\"buyPart(".$_SESSION['userCar'].",".$part['id'].",".$_SESSION['userId'].")\">Buy</button></td>";
                                        echo "</tr>";
                                    }
                                }
                            ?>
                                </table>
                            <?php
                                    }
                                }
                            ?>
                        </article>
                        <article role="tabpanel" hidden id="tab-B">
                            <?php
                                foreach($sections as $section){
                                    if($section['category']=='Dynamic'){
                                        echo "<h4 class=\"mt-2\">".$section['name']."</h4>";
                            ?>
                            <table class="text-center" style="width:100%">
                                <tr>
                                    <th class="status-bar-field">Level</th>
                                    <th class="status-bar-field">Image</th>
                                    <th class="status-bar-field">Description</th>
                                    <th class="status-bar-field">Price</th>
                                    <th class="status-bar-field">Speed +</th>
                                    <th class="status-bar-field">Acceler. +</th>
                                    <th class="status-bar-field">Revving +</th>
                                    <th class="status-bar-field">Transmis. +</th>
                                    <th class="status-bar-field">Slow Turn +</th>
                                    <th class="status-bar-field">Fast Turn +</th>
                                    <th class="status-bar-field">Brake +</th>
                                    <th class="status-bar-field">Traction +</th>
                                    <th class="status-bar-field">CV +</th>
                                    <th class="status-bar-field">NM +</th>
                                    <th class="status-bar-field">KG -</th>
                                    <th class="status-bar-field">Buy</th>
                                </tr>
                            <?php
                                foreach($parts as $part){
                                    if($part['name']==$section['name']){
                                        echo "<tr>";
                                        echo "<td class=\"status-bar-field\">".$part['level']."</td>";
                                        echo "<td class=\"status-bar-field\"><img src=\"img/part/".$part['image']."\" class=\"partImage\"></td>";
                                        echo "<td class=\"status-bar-field\">".$part['description']."</td>";
                                        echo "<td class=\"status-bar-field\">".euroFormat($part['price'])."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['speedBonus']>0 ? percentFormat($part['speedBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['accelBonus']>0 ? percentFormat($part['accelBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['revvBonus']>0 ? percentFormat($part['revvBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['transBonus']>0 ? percentFormat($part['transBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['turnSlowBonus']>0 ? percentFormat($part['turnSlowBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['turnFastBonus']>0 ? percentFormat($part['turnFastBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['brakeBonus']>0 ? percentFormat($part['brakeBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['tractBonus']>0 ? percentFormat($part['tractBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['cvBonus']>0 ? percentFormat($part['cvBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['nmBonus']>0 ? percentFormat($part['nmBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\">".($part['kgBonus']>0 ? percentFormat($part['kgBonus']) : "-")."</td>";
                                        echo "<td class=\"status-bar-field\"><button onClick=\"buyPart(".$_SESSION['userCar'].",".$part['id'].",".$_SESSION['userId'].")\">Buy</button></td>";
                                        echo "</tr>";
                                    }
                                }
                            ?>
                                </table>
                            <?php
                                    }
                                }
                            ?>
                        </article>
                    </section>
                    <button class="mt-2" onclick="location.href='shop.php';">Back</button>
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