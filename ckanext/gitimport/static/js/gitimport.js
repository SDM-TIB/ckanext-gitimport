document.addEventListener("DOMContentLoaded", function () {
  // Function to clear fields by their IDs
  function clearFieldsById(fieldIds) {
    fieldIds.forEach(function (fieldId) {
      var field = document.getElementById(fieldId);
      if (field) {
        field.value = "";
      }
    });
  }

  // Function to clear dynamically named fields with a base pattern and starting index
  function clearDynamicFields(baseIdPattern, startIndex) {
    var index = startIndex;
    var fieldId, field;
    while (field = document.getElementById(fieldId = baseIdPattern.replace('${index}', index))) {
      field.value = "";
      index++;
    }
  }

  // Function to reset/clear all the GitHub metadata fields
  function resetFields() {
    var metadataFields = [
      "field-github_owner",
      "field-license",
      "field-github_description",
      "field-repository_stars",
      "field-repository_forks",
      "field-programming_language",
    ];

    // Clear metadata fields
    clearFieldsById(metadataFields);

    // Clear dynamic fields for contributors, authors, and topics
    clearDynamicFields('field-github_contributors-${index}-contributor', 0);
    clearDynamicFields('field-github_authors-${index}-author', 0);
    clearDynamicFields('field-github_topics-${index}-repository_topic', 0);
  }

  // Function to fetch GitHub repository metadata from the endpoint
  function fetchGitHubMetadata(repoName) {
    var apiUrl = `/gitimport/fetch?repo_name=${encodeURIComponent(repoName)}`;

    // Make a fetch request to the endpoint
    return fetch(apiUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.error) {
            resetFields();
            console.error("Error fetching metadata from server:", data.error);
          } else {
            // Populate metadata fields
            document.getElementById("field-github_owner").value = data.owner || "Owner not found";
            document.getElementById("field-license").value = data.license || "License not found";
            document.getElementById("field-github_description").value = data.description || "Description not found";
            document.getElementById("field-repository_stars").value = data.stars || 0;
            document.getElementById("field-repository_forks").value = data.forks || 0;
            document.getElementById("field-programming_language").value = data.programming_language || "No programming language found";

            // Handle topics and contributors
            handleTopics(data.topics || []);
            handleContributors(data.contributors || []);

            // Set README URL
            if (data.readme_content) {
              // Populate the README content into the "notes" field
              document.getElementById("field-notes").value = data.readme_content;
            } else {
              console.error("README content not found.");
            }


            /*if (data.readme_url) {
              sessionStorage.setItem("githubReadmeUrl", data.readme_url);
              setReadmeLink(data.readme_url);
            } else {
              console.error("README URL not found.");
            }*/
          }
        })
        .catch(function (error) {
          resetFields();
          console.error("Failed to fetch GitHub metadata from server:", error);
        });
  }

  function handleAuthors(contributors) {
    var authors = contributors.map(contributor => contributor.name).filter(name => name);

    authors.forEach((author, index) => {
      var fieldId = `field-github_authors-${index}-author`;
      var existingField = document.getElementById(fieldId);

      // Check if the field already exists before adding new ones
      if (!existingField) {
        var addButton = document.querySelectorAll('.btn.btn-link[name="repeating-add"]')[1];
        addButton.click();
        existingField = document.getElementById(fieldId);
      }

      if (existingField) {
        existingField.value = author;
      }
    });
  }

  function handleContributors(contributors) {
    contributors.forEach((contributor, index) => {
      var fieldId = `field-github_contributors-${index}-contributor`;
      var existingField = document.getElementById(fieldId);

      // Check if the field already exists before adding new ones
      if (!existingField) {
        var addButton = document.querySelector('.btn.btn-link[name="repeating-add"]');
        addButton.click();
        existingField = document.getElementById(fieldId);
      }

      if (existingField) {
        existingField.value = contributor.login;
      }
    });

    handleAuthors(contributors);
  }

  function handleTopics(topics) {
    topics.forEach((topic, index) => {
      var fieldId = `field-github_topics-${index}-repository_topic`;
      var existingField = document.getElementById(fieldId);

      // Check if the field already exists before adding new ones
      if (!existingField) {
        var addButton = document.querySelectorAll('.btn.btn-link[name="repeating-add"]')[2];
        addButton.click();
        existingField = document.getElementById(fieldId);
      }

      if (existingField) {
        existingField.value = topic;
      }
    });
  }

  // Main logic — button is rendered by github_repo.html, just wire up events.
  var repoInput = document.getElementById("field-github_repo");
  var fetchButton = document.getElementById("fetch-metadata-btn");
  // lastFetchedRepo tracks what was actually fetched, so blur and button
  // click can avoid re-fetching the same repo. originalRepoName tracks the
  // typed value so the input listener can detect changes and reset fields.
  var originalRepoName = "";
  var lastFetchedRepo = "";

  function setButtonLoading(loading) {
    if (!fetchButton) return;
    if (loading) {
      fetchButton.disabled = true;
      fetchButton.innerHTML = '<span class="glyphicon glyphicon-refresh gitimport-spinning"></span> Fetching…';
    } else {
      fetchButton.disabled = false;
      fetchButton.textContent = fetchButton.dataset.label;
    }
  }

  function doFetch(repoName) {
    resetFields();
    setButtonLoading(true);
    fetchGitHubMetadata(repoName).finally(function () {
      setButtonLoading(false);
    });
    lastFetchedRepo = repoName;
  }

  if (repoInput) {
    // Store the original button label so it can be restored after loading
    if (fetchButton) {
      fetchButton.dataset.label = fetchButton.textContent.trim();
      fetchButton.addEventListener("click", function (event) {
        event.preventDefault();
        var repoName = repoInput.value.trim();
        if (repoName) {
          doFetch(repoName);
        }
      });
    }

    // Event listener for "input" events
    repoInput.addEventListener("input", function () {
      var repoName = this.value.trim();

      // If the user erases the repoName, reload the page
      if (repoName === "") {
        resetFields();
        originalRepoName = "";
        lastFetchedRepo = "";
        window.location.reload();
        return;
      }

      // If the repo name changes, reset fields and clear the last fetch
      if (repoName !== originalRepoName) {
        resetFields();
        originalRepoName = repoName;
        lastFetchedRepo = "";
      }
    });

    // Fetch on blur so the user doesn't have to click the button
    repoInput.addEventListener("blur", function () {
      var repoName = this.value.trim();
      if (repoName && repoName !== lastFetchedRepo) {
        doFetch(repoName);
      }
    });

    // Event listener for "paste" events
    repoInput.addEventListener("paste", function (event) {
      event.preventDefault();
      var pastedText = (event.clipboardData || window.clipboardData).getData("text");
      var newRepoName = pastedText.trim();
      this.value = newRepoName;

      resetFields();
      lastFetchedRepo = "";
    });
  }

});

// Function to set the README link in the input field
window.setReadmeLink = function(readmeUrl) {
  var linkButton = document.getElementById("resource-link-button");
  if (linkButton) {
    linkButton.click();
  }

  setTimeout(function() {
    var urlInputField = document.getElementById("field-resource-url");
    if (urlInputField) {
      urlInputField.value = readmeUrl;
    }
  }, 100);
};

document.addEventListener("DOMContentLoaded", function() {
  var urlPattern = /\/github\/[^\/]+\/resource\/new/;
  if (urlPattern.test(window.location.href)) {
    var readmeUrl = sessionStorage.getItem("githubReadmeUrl");
    if (readmeUrl) {
      setReadmeLink(readmeUrl);
      console.log("Retrieved README URL from sessionStorage and set in input field:", readmeUrl);
    } else {
      console.log("No README URL found in sessionStorage");
    }
  }
});
