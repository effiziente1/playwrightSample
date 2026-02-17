"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestStatusIcon = exports.Severity = void 0;
var Severity;
(function (Severity) {
    Severity["minor"] = "minor";
    Severity["moderate"] = "moderate";
    Severity["serious"] = "serious";
    Severity["critical"] = "critical";
})(Severity || (exports.Severity = Severity = {}));
var TestStatusIcon;
(function (TestStatusIcon) {
    TestStatusIcon["passed"] = "check_circle";
    TestStatusIcon["failed"] = "cancel";
    TestStatusIcon["skipped"] = "remove_circle";
    TestStatusIcon["timedOut"] = "alarm_off";
    TestStatusIcon["interrupted"] = "block";
})(TestStatusIcon || (exports.TestStatusIcon = TestStatusIcon = {}));
