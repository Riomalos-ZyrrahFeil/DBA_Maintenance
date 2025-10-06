<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=terms.xls");

$result = $conn->query("SELECT * FROM tbl_term");

echo "Term ID\tTerm Code\tStart Date\tEnd Date\n";

while($row = $result->fetch_assoc()){
    echo $row['term_id'] . "\t" . $row['term_code'] . "\t" . $row['start_date'] . "\t" . $row['end_date'] . "\n";
}
?>
