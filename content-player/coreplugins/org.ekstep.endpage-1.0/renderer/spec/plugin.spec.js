describe('Endpage Plugin', function() {
	var manifest, endPageInstance;
    beforeAll(function(callback) {
        org.ekstep.contentrenderer.loadPlugins([{"id":"org.ekstep.endpage","ver":1,"type":"plugin"}], [], function() {
   			console.log("endpage plugin is loaded");
			endPageInstance = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.endpage'];
			manifest = org.ekstep.pluginframework.pluginManager.pluginManifests['org.ekstep.endpage'];
            callback();
		});
    });
    describe("When plugin is initialized", function() {
    	it("It should invoke loadNgModules", function() {
            var ngController = org.ekstep.service.controller;
    		spyOn(ngController, "loadNgModules").and.callThrough();
            endPageInstance.initialize(manifest);
            expect(endPageInstance.templatePath).not.toBeUndefined();
            expect(endPageInstance.controllerPath).not.toBeUndefined();
        })
    });
});