<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// If a single room_id is requested
if (isset($_GET['room_id'])) {
    $id = intval($_GET['room_id']);
    $stmt = $conn->prepare("SELECT * FROM tbl_room WHERE room_id = ? AND is_delete = 0");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    $stmt->close();
} else {
    // Base SQL to fetch all rooms that are not soft-deleted
    $sql = "SELECT * FROM tbl_room WHERE is_delete = 0";

    // Optional: handle search query
    if (isset($_GET['search']) && $_GET['search'] !== "") {
        $search = $conn->real_escape_string($_GET['search']);
        $sql .= " AND (room_code LIKE '%$search%' OR building LIKE '%$search%')";
    }

    // Optional: handle sorting from JS
    $allowedCols = ['room_id', 'room_code', 'capacity', 'building'];
    $sortBy = isset($_GET['sort_by']) && in_array($_GET['sort_by'], $allowedCols) ? $_GET['sort_by'] : 'room_id';
    $order  = isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC'; // Default DESC
    $sql .= " ORDER BY $sortBy $order";

    $result = $conn->query($sql);
    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }
    echo json_encode($rooms);
}

$conn->close();
?>
