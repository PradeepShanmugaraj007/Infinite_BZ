n=int(input())
if n==2 or n==3:
    print("Prime")
else:
    for i in range(2,n):
        if n%i==0:
            print("Not Prime")
            break
    else:
        print("Prime")