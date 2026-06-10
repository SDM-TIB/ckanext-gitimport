# ckanext-gitimport
The CKAN GitImport Plugin enables users to fetch and display GitHub repository metadata within a specialized "GitHub" template in the CKAN user interface. After the metadata is displayed, it can be stored within CKAN datasets. This plugin streamlines the process of linking GitHub repositories with CKAN datasets, making it more efficient and user-friendly.

## Features
- **Fetch GitHub Repository Metadata**: Automatically retrieves metadata from GitHub repositories by simply adding the repository name then pressing the "Fetch Metadata" button.
- **Dynamic Field Population**: Dynamically populates CKAN dataset fields with fetched GitHub metadata, such as contributors, topics, etc., as needed.
- **User-Friendly Interface**: Seamlessly integrates with CKAN's UI.

## Requirements
Compatibility with core CKAN versions:

| CKAN version    | Compatible?   |
|-----------------| ------------- |
| 2.11 and newer  | not tested    |
| 2.10            | yes           |
| 2.9             | yes           |
| 2.8 and earlier | not tested    |

This extension also requires [`ckanext-scheming`](https://github.com/ckan/ckanext-scheming) to be installed. 

## Installation

To install ckanext-gitimport:

1. Activate your CKAN virtual environment, for example:
   ```bash
   . /usr/lib/ckan/default/bin/activate
   ```

2. Clone the source and install it on the virtualenv
   ```bash
   git clone https://github.com/SDM-TIB/ckanext-gitimport
   cd ckanext-gitimport
   pip install -e .
   pip install -r requirements.txt
   ```

3. **Add support for the "GitHub" dataset type title in your CKAN theme**:  
   If you are using a custom CKAN theme such as `ckanext-TIBtheme`, you **must** update the method `get_dataset_type_title` in:

   `ckanext-TIBtheme/ckanext/TIBtheme/plugin.py`
   
	to this:

    ```python
    def get_dataset_type_title(dataset_type):
        aux_list = {
            'dataset': 'Dataset',
            'vdataset': 'Imported Dataset',
            'service': 'Service',
            'github': 'GitHub'  # Add this line
        }
    ```

    This step is required to ensure the "GitHub" dataset type displays correctly in the CKAN UI.

4. Add the following fields to your `schema.xml` for Solr in order to index the corresponding fields:

   ```xml
   <field name="github_contributors" type="string" indexed="true" stored="true" multiValued="true"/>
   <field name="github_authors" type="string" indexed="true" stored="true" multiValued="true"/>
   <field name="github_topics" type="string" indexed="true" stored="true" multiValued="true"/>
   ```

5. Restart CKAN. For example if you've deployed CKAN with Apache on Ubuntu:
   ```bash
   sudo service apache2 reload
   ```

## Config Settings

1. Add the plugin `gitimport` to the `ckan.plugins` list in the CKAN config file`ckan-entrypoint.sh`.
  
2. Add `ckanext.gitimport:ckan_github.yaml` to the `scheming.dataset_schemas` entry in your CKAN config.
  
3. The plugin requires a GitHub access token to fetch repository data. Please ensure that the token is valid as they usually expire after a certain time. You will need to regenerate a new token periodically to maintain functionality.

4. Add your GitHub access token to your CKAN config file:

    ```ini
   ckanext.gitimport.github_access_token = YOUR_GITHUB_ACCESS_TOKEN
   ``` 

5. You can disable the "GitHub Import" link in the header by setting the following in your CKAN config file:

   ```ini
   ckanext.gitimport.add_header_link = false
   ```

## How it works?
To use the plugin:

1. In your CKAN instance, access the "GitHub Import" button in navigation bar.
2. Then click on "Add GitHub" where you will find the template.
3. Enter the GitHub repository name (e.g., `SDM-TIB/ckanext-gitimport`) in the provided template field then press the "Fetch Metadata" button.
4. The plugin will then fetch and display the repository metadata.

## Note
This plugin is designed to work with the "GitHub" template, which is created using the `ckanext-scheming` extension.
The template consists of a YAML file that details the schema and the necessary HTML files.
Ensure that `ckanext-scheming` is also installed and properly configured in your CKAN instance.
