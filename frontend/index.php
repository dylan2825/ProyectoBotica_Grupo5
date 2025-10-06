<?php
$page = isset($_GET['page']) ? $_GET['page'] : 'inventario';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="p-4 flex-grow-1">
  <?php include "pages/$page.php"; ?>
</main>

<?php include 'includes/footer.php'; ?> 
