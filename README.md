# TOTP Drive Uploader

A web app that lets users upload data to their own google drives without logging in using TOTP.

## Future Updates

* [X] optimize db queries.
* [X] add inserting, updating url-slug functionality.
* [ ] add folder renaming functionality.
* [ ] update frontend with the one from GearGuard. (need to show and ask Dhruvil)
* [ ] ask dhruvil about hardcoding the google callback url and the upload request url. (instead of in .env)
* [ ] add image (brand logo) to provisioning URI generator.
* [ ] Add a delete user functionality in the frontend.
* [ ] Rename "jwt_handler.py" to "jwt_manager.py" for consistency.
* [ ] Ask dhruvil about why he kept `auto_error=False` and not the default true value. (dependencies.py)
