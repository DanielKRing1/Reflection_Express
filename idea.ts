/**
 * Login
 *      (no session)
 *      POST '/create-user'
 *                                          - create user in db
 *
 *      (access session)
 *      POST '/login'                       with {userId, password}
 *                                          - validate user credentials
 *                                          - invalid, then destroy session and return error code
 *                                          - create jwt with {userId}
 *
 *      (refresh session)
 *      POST '/login/get-refresh'           with jwt
 *                                          - is an 'internal-only' endpoint
 *                                          - verify jwt
 *                                          - invalid, then destroy session and return error code
 *                                          - create refresh session and return success code
 *
 *      RETURN TO '/login'                  with refresh session cookie
 *                                          - if receive error code, then destroy session and return error code
 *                                          - get cookie from res.cookie
 *                                          - parse cookie for user info
 *                                          - create access session with user info
 *                                          - merge refresh cookie into res.cookie
 *                                          - return success code
 *                                          - on error, destroy session and return error code
 *
 *      RETURN TO '/create-user'            with access and refresh session cookies
 *                                          - if receive error code, then destroy session and return error code
 *                                          - get cookies from res.cookie
 *                                          - merge cookies into res.cookie
 *                                          - on error, destroy session and return error code
 *
 * Refresh
 *      (refresh session)
 *      POST '/refresh'                     with refresh cookie
 *                                          - invalid session, then destroy session and return error code
 *                                          - check if cookie is > half expired
 *                                          - if so, regenerate cookie
 *                                          - create jwt (with userId from refresh session)
 *
 *      (access session)
 *      POST '/refresh/get-access           with jwt
 *                                          - is an 'internal-only' endpoint
 *                                          - verify jwt
 *                                          - invalid, then destroy session and return error code
 *                                          - create access session and return success code
 *
 *      RETURN TO '/refresh'                with access session cookie
 *                                          - if receive error code, then destroy session and return error code
 *                                          - get access cookie from res.cookie
 *                                          - merge cookie into res.cookie
 *                                          - on error, destroy session and return error code
 */
