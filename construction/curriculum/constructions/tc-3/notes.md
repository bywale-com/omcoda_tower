# TC-3 notes

Write in your words. Do not paste the chapter.

## Leftover

`flex: auto` without `display: flex`. What you thought it did. What has to be true of the box.

- It's a great point to bring up. Because from my past css work, I know flex is what is used to arrange / organize components, I naturally tried flex. I may I'm assumed flex:auto initiates a default arrangement for any other occupants inside of div. Something akin to a default configuration. I still have no clue at this current point how to implement it. But we'll find out.

Now, if by box, you're referring to the **container** i.e <div>, that's housing the components to be flexed...hmm. Now that I htink about it, I think the way I think declarations made to tags affect the elements within the tag specifically. So like the associated label of the tags, it's text color e.t.c And maybe even children. I'll test it.

--- No I test that assumption. It doesn't affect the styling of it's sub components ( if they can be called that). So by that in almost a way, what I attempted to do with the flex could nto have worked that way. 

I naturally now suspect if class is the misssing thing.  I'll try that.
--- Ok well that didn't work. I specifically tried to this:

<!-- <div class="flex">This is a div</div>
            <p>This is a Header 1</p>
            <p>This paragraph should be a different color than the heading</p>
        </div> -->
....
<!-- 
        <style>
            .flex {
                display: flex;
                flex: content;
            } -->

## 3.1 color is not arrangement

Prediction (before new layout rules):
- I didn't quite think it could, but maybe at a large enough size, I thought the larger text could creap into the space of the smaller text. Basically at enough of a size discrepancy. Perhaps.

What I tried with color / font-size / one margin:
- I create two classes., and then tried my experiment.
                .p1 {
                font-size: 5px;
            }

            .p2 {
                color: blue;
            }


What happened: Didn't work.

## 3.2 the box

Which occupant: 
- <p> and class p

Padding / border / margin — prediction, then result: Yes, I was able to create a nice color box to clearly distinguish between margin, padding and border. I also discovered the synatx in the process ( I realized that hovering over a placed syntax reveals so more information about it's synatax i.e arguments and parameters.)

- It's very simply now. Border pushes in the content. It doesn't go outward. The thicker the border, the less space there is inside the element ( unless perhaps another rule constrains that). That's one key thing I understand about the relationship.

## 3.3 flex

Parent selector:

Row rule:

Stack (one property change) — prediction, then result:

## 3.4 grid

Parent:

Column rule:

Narrow window:

## 3.5 cascade

The two rules:

Which won, and why:

## Proofs

### Predict

### Explain

### Transform (written before changing files)

1. Row → stack:

2. Only the middle item:

3. Narrow stack / wide row:

### Break

### Diagnose

### Reconstruct

### Transfer

## Door

Same mechanisms, production vocabulary. What is that buying (in your words — not a brand name if you don’t have one)?

## Uncertain
