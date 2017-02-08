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
$id = 0;
$found = false;
foreach ($arr['clubs'] as $key => $value) {
    $club = $value['name'];
    if (array_key_exists($check, $value['members'])) {
        array_push($clubs, $club);
        $found = true;
        $first = $value['members'][$check]['first'];
        $last = $value['members'][$check]['last'];
        if (array_key_exists('id', $value['members'][$check])) {
            $id = $value['members'][$check]['id'];
        } else {

            $times = 0;
            while($arr['lock'] > 0 && $times < 10000) {
                $arr = $firebase->get('/');
                $times = $times + 1;
            }

            $firebase->update(['lock' => 1], '/');

            $nextId = $arr['runningID'];
            $id = $nextId;
            $nextId = $nextId + 1;
            $firebase->update(['runningID' => $nextId], '/');
            $firebase->set(['id' => $id, 'first' => $first, 'last' => $last], '/clubs' . '/' . $key . '/members' . '/' . $check);

            
            $firebase->update(['lock' => 0], '/');
        }
    }
}
$ret = [];
$ret['clubs'] = $clubs;
$ret['first'] = $first;
$ret['last'] = $last;
$ret['found'] = $found;
$ret['id'] = $id;

header('Content-Type: application/json');
echo json_encode($ret);

?>