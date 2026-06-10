from ckan.common import config
from ckan.plugins.toolkit import asbool


def gitimport_header():
    """Whether to add the GitHub import link to the header."""
    return bool(asbool(config.get("ckanext.gitimport.add_header_link", True)))
