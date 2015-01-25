/**
 * Authored by  AlmogBaku
 *              almog.baku@gmail.com
 *              http://www.almogbaku.com/
 *
 * 9/8/13 9:33 PM
 */

angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
});


/**
 * DEBUG!!!!!! @TODO remove it!
 */
function getApp(service) {
    return angular.element(document).injector().get(service);
}