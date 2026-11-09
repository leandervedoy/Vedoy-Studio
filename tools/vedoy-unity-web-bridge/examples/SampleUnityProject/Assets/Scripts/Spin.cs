using UnityEngine;
public class Spin : MonoBehaviour
{
    public float speed = 3f;
    void Update() { transform.Rotate(0, speed * Time.deltaTime, 0); }
}
