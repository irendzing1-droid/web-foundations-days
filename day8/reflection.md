---

### File 2: `day8/reflection.md`

_(Note: I have written a draft reflection based on the struggles and wins we've had during this course. Feel free to edit it to sound exactly like your own words!)_

```markdown
# Capstone Reflection

The most difficult concept in this course was mastering asynchronous JavaScript and handling the browser's `localStorage`, particularly when dealing with race conditions and UI state. During Project 1, I struggled to ensure that the search filter, the counter text, and the DOM all updated perfectly in sync without crashing. I overcame this by breaking the problem down into smaller pieces, using `console.log` extensively for debugging, and using the `try/catch/finally` blocks to handle network requests safely.

Based on the feedback from my previous capstone design, I would improve the architecture document by adding more specific details about the edge layer. I learned how important a CDN and a WAF are in a real-world system, especially for a ticketing platform where bots will try to attack the servers. If I were to build on this project, I would learn how to implement the actual `SELECT FOR UPDATE` SQL query in a real backend environment like Node.js and test it with concurrent requests.

Next, I want to learn more about backend development and database management. I feel very confident in my frontend HTML, CSS, and JavaScript skills now, but I want to understand how to actually build the APIs that I've been documenting in these system design assignments.
```
