# Nate's Contact Manager

## Usage notes

### Search functionality

1. Typing text in the search field will filter the contacts to only those
   containing that text. It is not case-sensitive.
2. Clicking once on a tag will include only those contacts that have that tag.
   Note that clicking multiple tags creates an "and" relationship. E.g. if you
   click a "work" tag and a "family" tag, then only contacts that have both
   those tags will be displayed.
3. Double-clicking on a tag will exclude contacts that have that tag. E.g. if
   you double-click on "work" then only contacts that don't have a "work" tag
   will be displayed.
4. All the above controls work together. E.g. if you type "a" in the search
   text field, click the "friend" tag, and double-click the "work" tag, then
   only people who have an "a" in their name, who are friends, and who you don't
  work with would be displayed.

### Add/Edit functionality

1. Only the name field is required and the only requirement for it is that it
   must contain one non-whitespace character.
2. If you put in a phone number, it can only contain digits or the special
   characters "()+- ,*#.". It also must contain at least one digit.
   Beyond that there is no other validation. This is because there's a huge
   variety of ways to express valid phone numbers and I've personally been
   inconvenienced many times by overzealous phone number validation.
3. Email addresses are validated.
4. New tags cannot contain a comma (,) character, otherwise anything goes.
5. To apply tags to a contact, you either click on the existing tags you want to
   apply or type new tags in the "new tags" box. New tags should be separated by
   spaces, so if you want to add the tag "fizz buzz" then you'll
   need to replace the space with an underscore or hyphen, otherwise you'll be
   adding two new tags. Also note that tags are automatically de-duplicated.

### Fun stuff

1. Double-clicking on a piece of data on one of the contact cards copies it to
   the system clipboard.
