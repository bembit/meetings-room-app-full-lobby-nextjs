#### todo, notes

- [x] shoulnd't be able to move back from started meeting.

- [ ] add validation, 1 user should only be able to start and be in one meeting.

- [x] add counter.

- [x] destory room on expire.


- [ ] kick rework

- [ ] no redirect on start

- [ ] kick no ui refresh, still can leave.

- [ ] back to waiting room btn visible when it shouldn't be. - Probably something with session.user_id render

- [ ] meeting room password optional?

- [ ] auto delete room should be handled by the server, and not the hacky creator calls the already existing delete handler.:D blizzcon demo code

- [ ] isInvited? check if user is invited to the room? how.

- buttons conditional renders are all over the place.

-should block / disable buttons, indicate loading while waiting for database
-auto delete stops once started
-creator of room is not handled to be isParticipant yet
-for now you can redirect back from started, but won't be able to send requests
-later we can handle kick ban, now we just add kicked users to an array an leave them there
-ready check validation is off to test toast messages for other blocked routes when meeting is started