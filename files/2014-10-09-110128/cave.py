import random

###########################
## Define some functions ##
###########################
def create_random_map(height, width):
    map = []
    for y in range(height):
        for x in range(width):
            map.append( bool(random.randint(0,1)) )
            
    return map
    
    
def apply_cellular_automaton(map, height, width, born, survive):
    new_map = []
    for y in range(height):
        for x in range(width):
            if x == 0 or y == 0 or y == height-1 or x == width-1:
                new_map.append(True)
            else:
                neighbours = 0
                
                neighbours += map[ ((y-1)*width)+(x-1) ]
                neighbours += map[ ((y-1)*width)+x ]
                neighbours += map[ ((y-1)*width)+(x+1) ]
                
                neighbours += map[ (y*width)+(x-1) ]
                neighbours += map[ (y*width)+(x+1) ]
                
                neighbours += map[ ((y+1)*width)+(x-1) ]
                neighbours += map[ ((y+1)*width)+x ]
                neighbours += map[ ((y+1)*width)+(x+1) ]
                
                if map[ (y*width)+x ]:
                    new_map.append(neighbours in survive)
                else:
                    new_map.append(neighbours in born)  
    return new_map
    
    
def draw_map(map, height, width):
    for y in range(height):
        row = ''
        for x in range(width):
            if map[y*width+x]:
                row += '#'
            else:
                row += ' '
        print row


#######################
##    Our Program    ##
#######################
                    
height = 45
width = 79

map = create_random_map(height, width)

for i in range(5):
    map = apply_cellular_automaton(map, height, width, [6, 7, 8], [3, 4, 5, 6, 7, 8])
    
for i in range(3):
    map = apply_cellular_automaton(map, height, width, [5, 6, 7, 8], [5, 6, 7, 8])

draw_map(map, height, width)
    

