<?
require __DIR__ . '/vendor/autoload.php';
use Kreait\Firebase\Configuration;
use Kreait\Firebase\Firebase;
use Kreait\Firebase\Query;

if (!isset($_GET['email'])) {
    die('Incorrect parameters');
    return;
}
$check = $_GET['email'];

$config = new Configuration();
$config->setAuthConfigFile(__DIR__.'google-service-account.json');

$firebase = new Firebase('https://plus-card-9682d.firebaseio.com', $config);
$query = new Query();

$arr = $firebase->get('/');

$clubs = [];
$first = "";
$last = "";
$found = false;
foreach ($arr as $key => $value) {
    $club = $value['name'];
    if (array_key_exists($check, $value['members'])) {
        array_push($clubs, $club);
        $found = true;
        $first = $value['members'][$check]['first'];
        $last = $value['members'][$check]['last'];
    }
}

$ret = [];
$ret['clubs'] = $clubs;
$ret['first'] = $first;
$ret['last'] = $last;
$ret['found'] = $found;

header('Content-Type: application/json');
echo json_encode($ret);

?>