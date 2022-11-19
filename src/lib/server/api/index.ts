import { ApiModel, ApiPackage } from '@microsoft/api-extractor-model';
import { TSDocConfiguration } from '@microsoft/tsdoc';
import core from './core.api.json';
import extensions from './extensions.api.json';
import functions from './functions.api.json';

type $IntentionalAny = any;

const corePackage = createPackage(core, 'core.api.json');
const extensionsPackage = createPackage(extensions, 'extensions.api.json');
const functionsPackage = createPackage(functions, 'functions.api.json');

const apiModel: ApiModel = new ApiModel();
apiModel.addMember(corePackage);
apiModel.addMember(extensionsPackage);
apiModel.addMember(functionsPackage);

const packages = [corePackage, extensionsPackage, functionsPackage];

export { packages };

function createPackage(json: $IntentionalAny, name: string): ApiPackage {
	return ApiPackage.deserialize(json as $IntentionalAny, {
		apiJsonFilename: name,
		toolPackage: json.metadata.toolPackage,
		toolVersion: json.metadata.toolVersion,
		versionToDeserialize: json.metadata.schemaVersion,
		tsdocConfiguration: new TSDocConfiguration()
	}) as ApiPackage;
}
