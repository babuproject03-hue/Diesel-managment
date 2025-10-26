<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dieseldata";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$errors = $incomeErrors = [];
$success = $incomeSuccess = false;
// Handle CSV Export
if (isset($_GET['export_csv'])) {
    // Start output buffering for safety
    ob_start();

    // Set CSV headers for browser
    header('Content-Type: text/csv; charset=utf-8');
    $filename = "export_" . htmlspecialchars($_GET['export_csv']) . ".csv";
    header("Content-Disposition: attachment; filename=\"$filename\"");

    // Open output stream
    $output = fopen('php://output', 'w');

    if ($_GET['export_csv'] === 'diesel') {
        // Fetch filters from GET
        $filterParty = $_GET['filterParty'] ?? '';
        $filterVehicle = $_GET['filterVehicle'] ?? '';
        $startDate = $_GET['startDate'] ?? '';
        $endDate = $_GET['endDate'] ?? '';

        // Build SQL with filters
        $sql = "SELECT dcno, datetime, partyname, vehicleno, diesellts, remarks FROM diesel_reports WHERE 1=1";
        $params = [];
        $types = '';

        if ($filterParty) {
            $sql .= " AND partyname = ?";
            $types .= 's';
            $params[] = $filterParty;
        }
        if ($filterVehicle) {
            $sql .= " AND vehicleno = ?";
            $types .= 's';
            $params[] = $filterVehicle;
        }
        if ($startDate && $endDate) {
            $sql .= " AND datetime BETWEEN ? AND ?";
            $types .= 'ss';
            $params[] = $startDate . ' 00:00:00';
            $params[] = $endDate . ' 23:59:59';
        }

        $sql .= " ORDER BY datetime DESC";

        $stmt = $conn->prepare($sql);
        if ($types) $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();

        // CSV Headers
        fputcsv($output, ['DC NO', 'Date & Time', 'Party Name', 'Vehicle No', 'Diesel LTS', 'Remarks']);

        while ($row = $res->fetch_assoc()) {
            $row['dcno'] = 'DC' . str_pad($row['dcno'], 2, '0', STR_PAD_LEFT);
            fputcsv($output, [
                $row['dcno'],
                $row['datetime'],
                $row['partyname'],
                $row['vehicleno'],
                number_format($row['diesellts'], 2),
                $row['remarks']
            ]);
        }
        $stmt->close();

    } elseif ($_GET['export_csv'] === 'income') {
        // Income report export (no filters in your current code)
        $sql = "SELECT id, date, customer, lts, rate, amount, paid, balance, remarks FROM income_reports ORDER BY date DESC";
        $res = $conn->query($sql);

        fputcsv($output, ['Bill No', 'Date', 'Customer', 'Litres', 'Rate', 'Amount', 'Paid', 'Balance', 'Remarks']);

        while ($row = $res->fetch_assoc()) {
            $row['id'] = 'BILL' . str_pad($row['id'], 3, '0', STR_PAD_LEFT);
            fputcsv($output, [
                $row['id'],
                $row['date'],
                $row['customer'],
                number_format($row['lts'], 2),
                number_format($row['rate'], 2),
                number_format($row['amount'], 2),
                number_format($row['paid'], 2),
                number_format($row['balance'], 2),
                $row['remarks']
            ]);
        }
    }

    fclose($output);
    ob_end_flush();
    exit;
}


// Diesel Entry POST logic
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_diesel'])) {
    $partyname = trim($_POST['partyname'] ?? '');
    $vehicleno = trim($_POST['vehicleno'] ?? '');
    $diesellts = $_POST['diesellts'] ?? '';
    $remarks = trim($_POST['remarks'] ?? '');
    $datetime = $_POST['datetime'] ?? '';

    if (!$partyname) $errors[] = 'Please select Party Name.';
    if (!$vehicleno) $errors[] = 'Please select Vehicle Number.';
    if (!$diesellts || !is_numeric($diesellts) || $diesellts <= 0) $errors[] = 'Enter valid positive Diesel LTS.';
    if (!$datetime) $errors[] = 'Please select Date & Time.';
    if ($datetime) $datetime = str_replace('T', ' ', $datetime) . ':00';

    if (empty($errors)) {
        $stmt = $conn->prepare("INSERT INTO diesel_reports (datetime, partyname, vehicleno, diesellts, remarks) VALUES (?, ?, ?, ?, ?)");
        if ($stmt === false) {
            die("Prepare failed (diesel insert): (" . $conn->errno . ") " . $conn->error);
        }
        $stmt->bind_param("sssds", $datetime, $partyname, $vehicleno, $diesellts, $remarks);
        if ($stmt->execute()) {
            $success = true;
        } else {
            $errors[] = 'Insert failed: ' . $stmt->error;
        }
        $stmt->close();
    }
}

// Income Entry POST logic
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['income_submit'])) {
    $customer = trim($_POST['customer'] ?? '');
    $lts = floatval($_POST['lts'] ?? 0);
    $rate = floatval($_POST['rate'] ?? 0);
    $paid = floatval($_POST['paid'] ?? 0);
    $amount = $lts * $rate;
    $balance = $amount - $paid;
    $date = $_POST['date'] ?? '';
    $remarks = trim($_POST['remarks'] ?? '');

    if (!$customer) $incomeErrors[] = 'Customer name required.';
    if (!$date) $incomeErrors[] = 'Select Date.';
    if ($lts <= 0 || $rate <= 0) $incomeErrors[] = 'Enter valid litres and rate.';
    if ($paid < 0) $incomeErrors[] = 'Paid cannot be negative.';

    if (empty($incomeErrors)) {
        $stmt = $conn->prepare("INSERT INTO income_reports (date, customer, lts, rate, amount, paid, balance, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        if ($stmt === false) {
            die("Prepare failed (income insert): (" . $conn->errno . ") " . $conn->error);
        }
        $stmt->bind_param("ssddddds", $date, $customer, $lts, $rate, $amount, $paid, $balance, $remarks);
        if ($stmt->execute()) {
            $incomeSuccess = true;
        } else {
            $incomeErrors[] = 'Database Error: ' . $stmt->error;
        }
        $stmt->close();
    }
}

// Filters for Diesel Report
$filterParty = $_GET['filterParty'] ?? '';
$filterVehicle = $_GET['filterVehicle'] ?? '';
$startDate = $_GET['startDate'] ?? '';
$endDate = $_GET['endDate'] ?? '';

$sql = "SELECT dcno, datetime, partyname, vehicleno, diesellts, remarks FROM diesel_reports WHERE 1=1";
$params = [];
$types = '';
if ($filterParty) {
    $sql .= " AND partyname = ?";
    $types .= 's';
    $params[] = $filterParty;
}
if ($filterVehicle) {
    $sql .= " AND vehicleno = ?";
    $types .= 's';
    $params[] = $filterVehicle;
}
if ($startDate && $endDate) {
    $sql .= " AND datetime BETWEEN ? AND ?";
    $types .= 'ss';
    $params[] = $startDate . ' 00:00:00';
    $params[] = $endDate . ' 23:59:59';
}
$sql .= " ORDER BY datetime DESC";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    die("Prepare failed (diesel filter): (" . $conn->errno . ") " . $conn->error);
}
if ($types) $stmt->bind_param($types, ...$params);
$stmt->execute();
$res = $stmt->get_result();
$records = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$totalDiesel = array_sum(array_column($records, 'diesellts'));

// Income report (unfiltered)
$incomeRecords = $conn->query("SELECT id, date, customer, lts, rate, amount, paid, balance, remarks FROM income_reports ORDER BY date DESC")->fetch_all(MYSQLI_ASSOC);
$totalIncome = array_sum(array_column($incomeRecords, 'lts'));
$totalPaid = array_sum(array_column($incomeRecords, 'paid'));
$totalBalance = array_sum(array_column($incomeRecords, 'balance'));
$stockLts = $totalIncome - $totalDiesel;

// Format ID display helpers
function formatDCNo($id) {
    return 'DC' . str_pad($id, 2, '0', STR_PAD_LEFT);
}
function formatBillNo($id) {
    return 'BILL' . str_pad($id, 3, '0', STR_PAD_LEFT);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Diesel Management</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
<style>
body { margin:0; font-family:Verdana, Arial; background:#003333; color:#fff; }
header, .bottom-summary { background:#066779; color:#62fc1b; padding:10px 20px; font-weight:bold; display: flex; align-items: center; }
header { position: fixed; top: 0; left: 0; right: 0; height: 56px; z-index: 1000; justify-content: space-between; }
header h1, header h2 { margin: 0 15px; }
nav.top-menu ul {
    list-style: none; margin: 0; padding: 0; display: flex; gap: 15px;
}
nav.top-menu ul li a {
    color: lightcyan; text-decoration: none; padding: 8px 12px; border-radius: 6px;
    display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer;
}
nav.top-menu ul li a.active,
nav.top-menu ul li a:hover {
    background: yellow; color: black;
}
.main-content {
    margin-top: 56px;
    padding: 20px;
}
.form-container {
    background: #022;
    border-radius: 10px;
    padding: 50px;
    margin-bottom: 25px;
}
h2 { color:#62fc1b; }
.btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; margin: 5px; }
.btn-save { background: lightgreen; }
.btn-cancel { background: crimson; color: #fff; }
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}
th, td {
    padding: 10px;
    border-bottom: 1px solid #666;
}
th {
    background: #004040;
    position: sticky;
    top: 0;
    z-index: 10;
}
.success { color:#0f0; }
.error { color:#f66; }
.top-filter-bar {
    margin-bottom: 8px;
    background: #047463ff;
    padding: 15px;
    border-radius: 100px;
    display: flex;
    gap: 18px;
    align-items: center;
    flex-wrap: wrap;
}
.top-filter-bar select, .top-filter-bar input {
    background: #003;
    color: magenta;
    border: 1px solid #888;
    border-radius: 25px;
    padding: 6px;
    min-width: 120px;
}
.bottom-summary {
    position: fixed;
    bottom: 0;
    left: 0px;
    right: 0;
    border-top: 2px solid rgba(231, 71, 8, 1);
    display: flex;
    justify-content: space-around;
    font-size: 1.1rem;
}
input, select {
    background: #003;
    color: magenta;
    border: 1px solid #888;
    border-radius: 25px;
    padding: 6px;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #05d7f3ff;
  color: #003300;
  border: 2px solid #62fc1b;
  padding: 10px;
  font-size: 1.2rem; /* controls icon size */
  width: 50px;
  height: 10px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn:hover,
.btn:focus {
  background-color: #003300;
  color: #eb0cebff;
  outline: none;
}

/* If you want distinct .btn-icon class you can define separately */
.btn-icon i {
  pointer-events: none; /* icon itself not clickable */
  font-size: 1.4rem;
}


</style>
</head>
<body>
<header>
    <div style="display:flex; align-items:center;">
        <h1>JP</h1>
        <h2>DIESEL MANAGEMENT</h2>


    <nav class="top-menu" aria-label="Main menu">
        <ul>
            <li><a href="javascript:void(0)" onclick="showSection('dieselEntry')" id="link-dieselEntry"><i class="fa-solid fa-gas-pump"></i> Diesel Entry</a></li>
            <li><a href="javascript:void(0)" onclick="showSection('incomeEntry')" id="link-incomeEntry"><i class="fa-solid fa-coins"></i> Income Entry</a></li>
            <li><a href="javascript:void(0)" onclick="showSection('dieselReport')" id="link-dieselReport"><i class="fa-solid fa-clipboard-list"></i> Diesel Report</a></li>
            <li><a href="javascript:void(0)" onclick="showSection('incomeReport')" id="link-incomeReport"><i class="fa-solid fa-file-invoice-dollar"></i> Income Report</a></li>
        </ul>
    </nav>
    
    <div class="export-buttons-container">
  <a href="?export_csv=diesel&filterParty=<?= urlencode($filterParty) ?>&filterVehicle=<?= urlencode($filterVehicle) ?>&startDate=<?= urlencode($startDate) ?>&endDate=<?= urlencode($endDate) ?>" class="btn btn-icon" aria-label="Expense Export">
    <i class="fa-solid fa-file-export"></i>
  </a>
  <a href="?export_csv=income" class="btn btn-icon" aria-label="Income Export">
    <i class="fa-solid fa-coins"></i>
  </a>
</div>
</header>

<main class="main-content">
<!-- Diesel Entry -->
<section id="dieselEntry" class="form-container" style="display:none;">
<h2>Diesel Entry</h2>
<?php if ($success): ?><p class="success">Diesel record saved.</p><?php endif; ?>
<?php foreach ($errors as $e) echo "<p class='error'>" . htmlspecialchars($e) . "</p>"; ?>
<form method="POST" autocomplete="off">
<input type="hidden" name="save_diesel" value="1">
<label>Date & Time:</label><br><input type="datetime-local" name="datetime" required><br><br>
<label>Party Name:</label><br>
<select name="partyname" required>
  <option value="">-- Select Party --</option>
  <option value="COMPANY">COMPANY</option>
  <option value="SRI SURYA INFRA">SRI SURYA INFRA</option>
  <option value="NARAYANABABU">NARAYANABABU</option>
  <option value="GHOUSE L&T">GHOUSE L&T</option>
  <option value="JANGA REDDY">JANGA REDDY</option>
  <option value="SUBBA RAO">SUBBA RAO</option>
  <option value="ADITYA">ADITYA</option>
</select><br><br>
<label>Vehicle No:</label><br>
<select name="vehicleno" required>
  <option value="">-- Select Vehicle --</option>
  <option value="AP39UX7309">AP39UX7309</option>
  <option value="AP39UL6479">AP39UL6479</option>
  <option value="AP07TD4849">AP07TD4849</option>
  <option value="TS08UH3617">TS08UH3617</option>
  <option value="AP07TM4579">AP07TM4579</option>
  <option value="AP39UZ6967">AP39UZ6967</option>
  <option value="BUCKET-1">BUCKET-1</option>
  <option value="BUCKET-2">BUCKET-2</option>
  <option value="BREAKER">BREAKER</option>
  <option value="JCB">JCB</option>
  <option value="DOZZER">DOZZER</option>
  <option value="GHOUSE L&T">GHOUSE L&T</option>
  <option value="SS BORE">SS BORE</option>
  <option value="KAMLESH BORE">KAMLESH BORE</option>
  <option value="NRB BORE">NRB BORE</option>
  <option value="NRB COMP">NRB COMP</option>
  <option value="VENKATAIAH COMP">VENKATAIAH COMP</option>
  <option value="SUBRAMANI COMP">SUBRAMANI COMP</option>
  <option value="NAGARAJ COMP">NAGARAJ COMP</option>
  <option value="HYUNDAI 210">HYUNDAI 210</option>
  <option value="SANY 210">SANY 210</option>
  <option value="ADITYA HYD 215">ADITYA HYD 215</option>
</select><br><br>
<label>Diesel Lts:</label><br><input type="number" step="0.01" name="diesellts" min="0.01" required><br><br>
<label>Remarks:</label><br><input type="text" name="remarks" maxlength="255"><br><br>
<button type="submit" class="btn btn-save">Save</button>
<button type="reset" class="btn btn-cancel">Clear</button>
</form>
</section>

<!-- Income Entry -->
<section id="incomeEntry" class="form-container" style="display:none;">
<h2>Income Entry</h2>
<?php if ($incomeSuccess): ?><p class="success">Income record saved.</p><?php endif; ?>
<?php foreach ($incomeErrors as $e) echo "<p class='error'>" . htmlspecialchars($e) . "</p>"; ?>
<form method="POST" autocomplete="off">
<input type="hidden" name="income_submit" value="1">
<label>Date:</label><br><input type="date" name="date" value="<?=date('Y-m-d')?>" required><br><br>
<label>Customer:</label><br><input type="text" name="customer" required><br><br>
<label>Litres:</label><br><input type="number" step="0.01" name="lts" id="ltsField" oninput="calcAmount()" min="0" required><br><br>
<label>Rate:</label><br><input type="number" step="0.01" name="rate" id="rateField" oninput="calcAmount()" min="0" required><br><br>
<label>Amount:</label><br><input type="text" id="amountField" name="amount" readonly><br><br>
<label>Paid:</label><br><input type="number" step="0.01" name="paid" id="paidField" oninput="calcBalance()" value="0" min="0" required><br><br>
<label>Remarks:</label><br><input type="text" name="remarks" maxlength="255"><br><br>
<button type="submit" class="btn btn-save">Save</button>
<button type="reset" class="btn btn-cancel">Clear</button>
</form>
</section>

<!-- Diesel Report -->
<section id="dieselReport" class="form-container" style="display:block;">
<h2>Diesel Records</h2>
<div class="top-filter-bar">
    <form method="GET" style="display:flex; gap:10px; flex-wrap:wrap;">
        <label>Party Name</label>
        <select name="filterParty" onchange="this.form.submit()">
            <option value="">All</option>
            <option value="COMPANY" <?=($filterParty=='COMPANY')?'selected':''?>>COMPANY</option>
            <option value="SRI SURYA INFRA" <?=($filterParty=='SRI SURYA INFRA')?'selected':''?>>SRI SURYA INFRA</option>
            <option value="NARAYANABABU" <?=($filterParty=='NARAYANABABU')?'selected':''?>>NARAYANABABU</option>
            <option value="GHOUSE L&T" <?=($filterParty=='GHOUSE L&T')?'selected':''?>>GHOUSE L&T</option>
            <option value="JANGA REDDY" <?=($filterParty=='JANGA REDDY')?'selected':''?>>JANGA REDDY</option>
            <option value="SUBBA RAO" <?=($filterParty=='SUBBA RAO')?'selected':''?>>SUBBA RAO</option>
            <option value="ADITYA" <?=($filterParty=='ADITYA')?'selected':''?>>ADITYA</option>
        </select>
        <label>Vehicle</label>
        <select name="filterVehicle" onchange="this.form.submit()">
            <option value="">All</option>
            <option value="AP39UX7309" <?=($filterVehicle=='AP39UX7309')?'selected':''?>>AP39UX7309</option>
            <option value="AP39UL6479" <?=($filterVehicle=='AP39UL6479')?'selected':''?>>AP39UL6479</option>
            <option value="AP07TD4849" <?=($filterVehicle=='AP07TD4849')?'selected':''?>>AP07TD4849</option>
            <option value="TS08UH3617" <?=($filterVehicle=='TS08UH3617')?'selected':''?>>TS08UH3617</option>
            <option value="AP07TM4579" <?=($filterVehicle=='AP07TM4579')?'selected':''?>>AP07TM4579</option>
            <option value="AP39UZ6967" <?=($filterVehicle=='AP39UZ6967')?'selected':''?>>AP39UZ6967</option>
            <option value="BUCKET-1" <?=($filterVehicle=='BUCKET-1')?'selected':''?>>BUCKET-1</option>
            <option value="BUCKET-2" <?=($filterVehicle=='BUCKET-2')?'selected':''?>>BUCKET-2</option>
            <option value="BREAKER" <?=($filterVehicle=='BREAKER')?'selected':''?>>BREAKER</option>
            <option value="JCB" <?=($filterVehicle=='JCB')?'selected':''?>>JCB</option>
            <option value="DOZZER" <?=($filterVehicle=='DOZZER')?'selected':''?>>DOZZER</option>
            <option value="GHOUSE L&T" <?=($filterVehicle=='GHOUSE L&T')?'selected':''?>>GHOUSE L&T</option>
            <option value="SS BORE" <?=($filterVehicle=='SS BORE')?'selected':''?>>SS BORE</option>
            <option value="KAMLESH BORE" <?=($filterVehicle=='KAMLESH BORE')?'selected':''?>>KAMLESH BORE</option>
            <option value="NRB BORE" <?=($filterVehicle=='NRB BORE')?'selected':''?>>NRB BORE</option>
            <option value="NRB COMP" <?=($filterVehicle=='NRB COMP')?'selected':''?>>NRB COMP</option>
            <option value="VENKATAIAH COMP" <?=($filterVehicle=='VENKATAIAH COMP')?'selected':''?>>VENKATAIAH COMP</option>
            <option value="SUBRAMANI COMP" <?=($filterVehicle=='SUBRAMANI COMP')?'selected':''?>>SUBRAMANI COMP</option>
            <option value="NAGARAJ COMP" <?=($filterVehicle=='NAGARAJ COMP')?'selected':''?>>NAGARAJ COMP</option>
            <option value="HYUNDAI 210" <?=($filterVehicle=='HYUNDAI 210')?'selected':''?>>HYUNDAI 210</option>
            <option value="SANY 210" <?=($filterVehicle=='SANY 210')?'selected':''?>>SANY 210</option>
            <option value="ADITYA HYD 215" <?=($filterVehicle=='ADITYA HYD 215')?'selected':''?>>ADITYA HYD 215</option>
        </select>
        <label>From</label>
        <input type="date" name="startDate" value="<?=htmlspecialchars($startDate)?>">
        <label>To</label>
        <input type="date" name="endDate" value="<?=htmlspecialchars($endDate)?>">
        <button type="submit" class="btn btn-save">Filter</button>
    </form>
</div>
<table>
<thead><tr><th>DC NO</th><th>Date & Time</th><th>Party</th><th>Vehicle</th><th>LTS</th><th>Remarks</th></tr></thead>
<tbody>
<?php foreach ($records as $r): ?>
<tr>
<td><?=formatDCNo($r['dcno'])?></td>
<td><?=htmlspecialchars($r['datetime'])?></td>
<td><?=htmlspecialchars($r['partyname'])?></td>
<td><?=htmlspecialchars($r['vehicleno'])?></td>
<td><?=number_format($r['diesellts'], 2)?></td>
<td><?=htmlspecialchars($r['remarks'])?></td>
</tr>
<?php endforeach; ?>
<tr>
<td colspan="4" align="right">Total:</td><td><?=number_format($totalDiesel, 2)?></td><td></td>
</tr>
</tbody>
</table>
</section>

<!-- Income Report -->
<section id="incomeReport" class="form-container" style="display:none;">
<h2>Income Records</h2>
<table>
<thead><tr><th>Bill No</th><th>Date</th><th>Customer</th><th>Litres</th><th>Rate</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Remarks</th></tr></thead>
<tbody>
<?php foreach ($incomeRecords as $i): ?>
<tr>
<td><?=formatBillNo($i['id'])?></td>
<td><?=htmlspecialchars($i['date'])?></td>
<td><?=htmlspecialchars($i['customer'])?></td>
<td><?=number_format($i['lts'], 2)?></td>
<td><?=number_format($i['rate'], 2)?></td>
<td><?=number_format($i['amount'], 2)?></td>
<td><?=number_format($i['paid'], 2)?></td>
<td><?=number_format($i['balance'], 2)?></td>
<td><?=htmlspecialchars($i['remarks'])?></td>
</tr>
<?php endforeach; ?>
<tr>
<td colspan="5" align="right">Totals:</td>
<td><?=number_format($totalIncome, 2)?></td>
<td><?=number_format($totalPaid, 2)?></td>
<td><?=number_format($totalBalance, 2)?></td>
<td></td>
</tr>
</tbody>
</table>
</section>
</main>

<div class="bottom-summary">
    <div><i class="fa-solid fa-coins"></i> Total Income (Lts): <?=number_format($totalIncome, 2)?></div>
    <div><i class="fa-solid fa-chart-column"></i> Total Expenses (Lts): <?=number_format($totalDiesel, 2)?></div>
    <div><i class="fa-solid fa-box"></i> Stock (Lts): <?=number_format($stockLts, 2)?></div>
</div>

<script>
// Show/hide sections based on menu selection and toggle active menu link
function showSection(sec) {
    const sections = ['dieselEntry', 'incomeEntry', 'dieselReport', 'incomeReport'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        el.style.display = (id === sec) ? 'block' : 'none';
        const link = document.getElementById('link-' + id);
        if (id === sec) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Calculate amount for income entry
function calcAmount() {
    const l = +document.getElementById('ltsField').value || 0;
    const r = +document.getElementById('rateField').value || 0;
    document.getElementById('amountField').value = (l * r).toFixed(2);
    calcBalance();
}

// Calculate balance for income entry (optional, you can update UI here if desired)
function calcBalance() {
    const amt = +document.getElementById('amountField').value || 0;
    const paid = +document.getElementById('paidField').value || 0;
    // Could display balance somewhere if needed
}

// Initial display
showSection('dieselReport');
</script>
</body>
</html>
