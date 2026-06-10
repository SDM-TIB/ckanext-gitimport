import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from .helpers import gitimport_header
from .views import gitimport


class GitimportPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IBlueprint)
    plugins.implements(plugins.ITemplateHelpers)

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("static", "gitimport")

    def get_blueprint(self):
        return [gitimport]

    def get_helpers(self):
        return {
            "gitimport_header": gitimport_header,
        }
