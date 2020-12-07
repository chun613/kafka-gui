const yaml = require('js-yaml');
const fs = require('fs');

module.exports.getConsumeTopics = () => {
    try {
        let fileContents = fs.readFileSync('./config.yaml', 'utf8');
        let data = yaml.safeLoad(fileContents);
    
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    }
}
